using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.UI;
using SafeGuard.Services.RoadblockService.Dto;

namespace SafeGuard.Services.RoadblockService;

[AbpAuthorize]
public class RoadblockAppService : ApplicationService, IRoadblockAppService
{
    private sealed class CachedRoadblocks
    {
        public DateTime ExpiresAtUtc { get; init; }
        public IReadOnlyList<RoadblockDto> Items { get; init; }
    }

    private sealed class OverpassResponse
    {
        public List<OverpassElement> Elements { get; set; } = new();
    }

    private sealed class OverpassElement
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public decimal? Lat { get; set; }
        public decimal? Lon { get; set; }
        public OverpassCenter Center { get; set; }
        public Dictionary<string, string> Tags { get; set; }
    }

    private sealed class OverpassCenter
    {
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
    }

    private const string OverpassEndpoint = "https://overpass-api.de/api/interpreter";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private static readonly ConcurrentDictionary<string, CachedRoadblocks> Cache = new();

    private readonly IHttpClientFactory _httpClientFactory;

    public RoadblockAppService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<ListResultDto<RoadblockDto>> GetLiveAsync(GetRoadblocksInput input)
    {
        if (input.South >= input.North || input.West >= input.East)
        {
            throw new UserFriendlyException("The supplied map bounds are invalid.");
        }

        var cacheKey = string.Join(":", new[]
        {
            input.South.ToString("0.000"),
            input.West.ToString("0.000"),
            input.North.ToString("0.000"),
            input.East.ToString("0.000"),
        });

        if (Cache.TryGetValue(cacheKey, out var cached) && cached.ExpiresAtUtc > DateTime.UtcNow)
        {
            return new ListResultDto<RoadblockDto>(cached.Items.ToList());
        }

        using var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(12);
        client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("SafeGuard", "1.0"));

        var query = BuildQuery(input);
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["data"] = query
        });

        using var response = await client.PostAsync(OverpassEndpoint, content);
        if (!response.IsSuccessStatusCode)
        {
            throw new UserFriendlyException($"Overpass returned {(int)response.StatusCode}.");
        }

        await using var stream = await response.Content.ReadAsStreamAsync();
        var payload = await JsonSerializer.DeserializeAsync<OverpassResponse>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var items = Normalize(payload?.Elements ?? new List<OverpassElement>());
        Cache[cacheKey] = new CachedRoadblocks
        {
            ExpiresAtUtc = DateTime.UtcNow.Add(CacheDuration),
            Items = items
        };

        return new ListResultDto<RoadblockDto>(items.ToList());
    }

    private static string BuildQuery(GetRoadblocksInput input)
    {
        return $@"
[out:json][timeout:25];
(
  node[""barrier""]({input.South},{input.West},{input.North},{input.East});
  way[""barrier""]({input.South},{input.West},{input.North},{input.East});
  node[""checkpoint""]({input.South},{input.West},{input.North},{input.East});
  way[""checkpoint""]({input.South},{input.West},{input.North},{input.East});
  node[""amenity""=""police""]({input.South},{input.West},{input.North},{input.East});
  way[""amenity""=""police""]({input.South},{input.West},{input.North},{input.East});
  node[""highway""=""traffic_signals""]({input.South},{input.West},{input.North},{input.East});
);
out center tags;
";
    }

    private static IReadOnlyList<RoadblockDto> Normalize(IEnumerable<OverpassElement> elements)
    {
        return elements
            .Select(element =>
            {
                var latitude = element.Lat ?? element.Center?.Lat;
                var longitude = element.Lon ?? element.Center?.Lon;

                if (!latitude.HasValue || !longitude.HasValue)
                {
                    return null;
                }

                return new RoadblockDto
                {
                    Id = $"overpass-{element.Type}-{element.Id}",
                    Label = InferLabel(element.Tags),
                    Latitude = latitude.Value,
                    Longitude = longitude.Value,
                    Source = "overpass"
                };
            })
            .Where(item => item != null)
            .GroupBy(item => item.Id)
            .Select(group => group.First())
            .Take(20)
            .ToList();
    }

    private static string InferLabel(IReadOnlyDictionary<string, string> tags)
    {
        if (tags == null)
        {
            return "Road constraint";
        }

        if (tags.TryGetValue("name", out var name) && !string.IsNullOrWhiteSpace(name))
        {
            return name;
        }

        if (tags.TryGetValue("checkpoint", out var checkpoint) && !string.IsNullOrWhiteSpace(checkpoint))
        {
            return $"Checkpoint - {checkpoint}";
        }

        if (tags.TryGetValue("barrier", out var barrier) && !string.IsNullOrWhiteSpace(barrier))
        {
            return $"Barrier - {barrier}";
        }

        if (tags.TryGetValue("amenity", out var amenity) && amenity == "police")
        {
            return "Police presence";
        }

        if (tags.TryGetValue("highway", out var highway) && !string.IsNullOrWhiteSpace(highway))
        {
            return $"Traffic control - {highway}";
        }

        return "Road constraint";
    }
}
