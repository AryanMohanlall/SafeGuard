using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Domain.Repositories;
using SafeGuard.Domains.Monitor;
using SafeGuard.Services.MonitorService.Dto;

namespace SafeGuard.Services.MonitorService
{
    public class MonitorAppService : ApplicationService, IMonitorAppService
    {
        private sealed class EarthCamPayload
        {
            public Dictionary<string, EarthCamCamera> Cam { get; set; } =
                new Dictionary<string, EarthCamCamera>(StringComparer.OrdinalIgnoreCase);
        }

        private sealed class EarthCamCamera
        {
            public string Name { get; set; }
            public string Location { get; set; }
            public string Stream { get; set; }
            public string Thumbnail_512 { get; set; }
        }

        private static readonly Regex JsonBasePattern =
            new Regex(@"var json_base\s*=\s*(\{[\s\S]*?\});", RegexOptions.Compiled);

        private static readonly HashSet<string> AllowedVideoHosts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "videos-3.earthcam.com",
            "video2archives.earthcam.com",
        };

        private static readonly HashSet<string> AllowedRefererHosts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "www.earthcam.com",
            "earthcam.com",
        };

        private const string UserAgent =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IRepository<LiveStream, Guid> _liveStreamRepository;

        public MonitorAppService(
            IHttpClientFactory httpClientFactory,
            IRepository<LiveStream, Guid> liveStreamRepository)
        {
            _httpClientFactory = httpClientFactory;
            _liveStreamRepository = liveStreamRepository;
        }

        public async Task<IReadOnlyList<MonitorCameraDto>> GetStreamsAsync()
        {
            var configuredStreams = (await _liveStreamRepository.GetAllListAsync(stream => stream.IsActive))
                .OrderBy(stream => stream.SortOrder)
                .ThenBy(stream => stream.Name)
                .ToList();

            var results = await Task.WhenAll(configuredStreams.Select(ResolveCameraSafelyAsync));

            return results
                .Where(camera => camera != null)
                .ToList();
        }

        public async Task<MonitorProxyResult> ProxyAsync(string target, string referer)
        {
            Uri targetUri;
            Uri refererUri;

            if (string.IsNullOrWhiteSpace(target) || string.IsNullOrWhiteSpace(referer))
            {
                return BadRequest("Missing target or referer.");
            }

            if (!Uri.TryCreate(target, UriKind.Absolute, out targetUri) ||
                !Uri.TryCreate(referer, UriKind.Absolute, out refererUri))
            {
                return BadRequest("Invalid target or referer URL.");
            }

            if (!string.Equals(targetUri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(refererUri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only https URLs are supported.");
            }

            if (!AllowedVideoHosts.Contains(targetUri.Host))
            {
                return BadRequest("Target host is not allowed.");
            }

            if (!AllowedRefererHosts.Contains(refererUri.Host))
            {
                return BadRequest("Referer host is not allowed.");
            }

            using (var client = CreateClient())
            using (var request = new HttpRequestMessage(HttpMethod.Get, targetUri))
            {
                request.Headers.Referrer = refererUri;
                request.Headers.TryAddWithoutValidation("Origin", refererUri.GetLeftPart(UriPartial.Authority));

                using (var response = await client.SendAsync(request))
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        return new MonitorProxyResult
                        {
                            StatusCode = (int)response.StatusCode,
                        };
                    }

                    var contentType = response.Content.Headers.ContentType != null
                        ? response.Content.Headers.ContentType.ToString()
                        : "application/octet-stream";

                    if (IsPlaylist(contentType, targetUri.ToString()))
                    {
                        var text = await response.Content.ReadAsStringAsync();
                        var rewritten = string.Join(
                            "\n",
                            text.Split('\n').Select(line =>
                            {
                                var trimmed = line.Trim();
                                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#", StringComparison.Ordinal))
                                {
                                    return line;
                                }

                                var nestedTarget = ResolveUri(trimmed, targetUri);
                                return BuildProxyUrl(nestedTarget, refererUri.ToString());
                            }));

                        return new MonitorProxyResult
                        {
                            StatusCode = 200,
                            ContentType = contentType,
                            Body = Encoding.UTF8.GetBytes(rewritten),
                        };
                    }

                    return new MonitorProxyResult
                    {
                        StatusCode = 200,
                        ContentType = contentType,
                        Body = await response.Content.ReadAsByteArrayAsync(),
                    };
                }
            }
        }

        private async Task<MonitorCameraDto> ResolveCameraSafelyAsync(LiveStream stream)
        {
            try
            {
                return await ResolveCameraAsync(stream);
            }
            catch
            {
                return null;
            }
        }

        private async Task<MonitorCameraDto> ResolveCameraAsync(LiveStream stream)
        {
            using (var client = CreateClient())
            {
                var html = await client.GetStringAsync(stream.SourceUrl);
                var match = JsonBasePattern.Match(html);

                if (!match.Success)
                {
                    throw new InvalidOperationException(string.Format("Unable to read stream metadata for {0}.", stream.Name));
                }

                var payload = JsonSerializer.Deserialize<EarthCamPayload>(match.Groups[1].Value, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                });

                EarthCamCamera camera;
                if (payload == null || payload.Cam == null || !payload.Cam.TryGetValue(stream.CamKey, out camera) || string.IsNullOrWhiteSpace(camera == null ? null : camera.Stream))
                {
                    throw new InvalidOperationException(string.Format("No live stream available for {0}.", stream.Name));
                }

                return new MonitorCameraDto
                {
                    Id = stream.Id.ToString(),
                    Name = FallbackIfBlank(camera.Name, stream.Name),
                    Location = FallbackIfBlank(camera.Location, stream.Location),
                    SourceName = FallbackIfBlank(stream.SourceName, "EarthCam"),
                    SourceUrl = stream.SourceUrl,
                    StreamUrl = BuildProxyUrl(Decode(camera.Stream), stream.SourceUrl),
                    ThumbnailUrl = FallbackIfBlank(Decode(camera.Thumbnail_512), stream.ThumbnailUrl),
                };
            }
        }

        private HttpClient CreateClient()
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(20);
            client.DefaultRequestHeaders.UserAgent.Clear();
            client.DefaultRequestHeaders.UserAgent.Add(ProductInfoHeaderValue.Parse("Mozilla/5.0"));
            client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", UserAgent);
            return client;
        }

        private static string BuildProxyUrl(string targetUrl, string referer)
        {
            var parameters = new Dictionary<string, string>
            {
                { "target", targetUrl },
                { "referer", referer },
            };

            return string.Format(
                "/api/monitor/proxy?{0}",
                string.Join(
                    "&",
                    parameters.Select(parameter =>
                        string.Format(
                            "{0}={1}",
                            Uri.EscapeDataString(parameter.Key),
                            Uri.EscapeDataString(parameter.Value)))));
        }

        private static string Decode(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Replace("\\/", "/");
        }

        private static string FallbackIfBlank(string value, string fallback)
        {
            return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        }

        private static string ResolveUri(string value, Uri baseUri)
        {
            Uri resolved;
            return Uri.TryCreate(baseUri, value, out resolved) ? resolved.ToString() : value;
        }

        private static bool IsPlaylist(string contentType, string targetUrl)
        {
            return contentType.Contains("application/vnd.apple.mpegurl", StringComparison.OrdinalIgnoreCase) ||
                   contentType.Contains("application/x-mpegurl", StringComparison.OrdinalIgnoreCase) ||
                   targetUrl.Contains(".m3u8", StringComparison.OrdinalIgnoreCase);
        }

        private static MonitorProxyResult BadRequest(string message)
        {
            return new MonitorProxyResult
            {
                StatusCode = 400,
                ErrorMessage = message,
            };
        }
    }
}
