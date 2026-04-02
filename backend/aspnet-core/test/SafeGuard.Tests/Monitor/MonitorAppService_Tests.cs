using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using NSubstitute;
using SafeGuard.Domains.Monitor;
using SafeGuard.Services.MonitorService;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Monitor
{
    public class MonitorAppService_Tests
    {
        [Fact]
        public async Task GetStreamsAsync_ShouldReturnResolvedCamerasWithProxiedUrls()
        {
            var factory = Substitute.For<IHttpClientFactory>();
            var repository = Substitute.For<Abp.Domain.Repositories.IRepository<LiveStream, Guid>>();
            factory.CreateClient().Returns(_ => CreateHttpClient(request =>
            {
                request.RequestUri.ShouldNotBeNull();
                request.RequestUri.Host.ShouldBe("www.earthcam.com");

                return new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(BuildEarthCamHtml())
                };
            }));
            repository.GetAllListAsync(Arg.Any<System.Linq.Expressions.Expression<Func<LiveStream, bool>>>())
                .Returns(Task.FromResult<System.Collections.Generic.List<LiveStream>>(new System.Collections.Generic.List<LiveStream>
                {
                    new LiveStream
                    {
                        Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                        Name = "Mulberry Street",
                        Location = "Manhattan, New York, USA",
                        SourceName = "EarthCam",
                        SourceUrl = "https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly",
                        CamKey = "littleitaly",
                        IsActive = true,
                        SortOrder = 1,
                    },
                    new LiveStream
                    {
                        Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                        Name = "Bourbon Street",
                        Location = "New Orleans, Louisiana, USA",
                        SourceName = "EarthCam",
                        SourceUrl = "https://www.earthcam.com/usa/louisiana/neworleans/bourbonstreet/?cam=bourbonstreet",
                        CamKey = "bourbonstreet",
                        IsActive = true,
                        SortOrder = 2,
                    },
                    new LiveStream
                    {
                        Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                        Name = "Abbey Road Crossing",
                        Location = "London, England, UK",
                        SourceName = "EarthCam",
                        SourceUrl = "https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk",
                        CamKey = "abbeyroad_uk",
                        IsActive = true,
                        SortOrder = 3,
                    },
                    new LiveStream
                    {
                        Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                        Name = "Temple Bar",
                        Location = "Dublin, Ireland",
                        SourceName = "EarthCam",
                        SourceUrl = "https://www.earthcam.com/world/ireland/dublin/?cam=templebar",
                        CamKey = "templebar",
                        IsActive = true,
                        SortOrder = 4,
                    },
                }));

            var service = new MonitorAppService(factory, repository);

            var cameras = await service.GetStreamsAsync();

            cameras.Count.ShouldBe(4);
            cameras[0].SourceName.ShouldBe("EarthCam");
            cameras[0].StreamUrl.ShouldContain("/api/monitor/proxy?");
            cameras[0].StreamUrl.ShouldContain("target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2F27777.flv%2Fplaylist.m3u8");
            cameras[2].Name.ShouldBe("Abbey Road Crossing");
            cameras[2].Location.ShouldBe("London, England, UK");
        }

        [Fact]
        public async Task ProxyAsync_ShouldRewritePlaylistEntriesThroughProxy()
        {
            const string referer = "https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly";
            const string target = "https://videos-3.earthcam.com/fecnetwork/27777.flv/playlist.m3u8";

            var client = CreateHttpClient(_ => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("#EXTM3U\nsegment0.ts\nhttps://videos-3.earthcam.com/fecnetwork/segment1.ts")
                {
                    Headers =
                    {
                        ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/vnd.apple.mpegurl")
                    }
                }
            });

            var factory = Substitute.For<IHttpClientFactory>();
            var repository = Substitute.For<Abp.Domain.Repositories.IRepository<LiveStream, Guid>>();
            factory.CreateClient().Returns(client);

            var service = new MonitorAppService(factory, repository);

            var result = await service.ProxyAsync(target, referer);
            var body = Encoding.UTF8.GetString(result.Body);

            result.StatusCode.ShouldBe(200);
            result.ContentType.ShouldContain("application/vnd.apple.mpegurl");
            body.ShouldContain("/api/monitor/proxy?target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2F27777.flv%2Fsegment0.ts");
            body.ShouldContain("/api/monitor/proxy?target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2Fsegment1.ts");
        }

        [Fact]
        public async Task ProxyAsync_ShouldRejectDisallowedHosts()
        {
            var factory = Substitute.For<IHttpClientFactory>();
            var repository = Substitute.For<Abp.Domain.Repositories.IRepository<LiveStream, Guid>>();
            var service = new MonitorAppService(factory, repository);

            var result = await service.ProxyAsync(
                "https://example.com/playlist.m3u8",
                "https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk");

            result.StatusCode.ShouldBe(400);
            result.ErrorMessage.ShouldBe("Target host is not allowed.");
        }

        private static HttpClient CreateHttpClient(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            return new HttpClient(new StubHttpMessageHandler(responder));
        }

        private static string BuildEarthCamHtml()
        {
            return
                "<html>" +
                "<script>" +
                "var json_base = {\"cam\":{" +
                "\"littleitaly\":{\"name\":\"Mulberry Street\",\"location\":\"Manhattan, New York, USA\",\"stream\":\"https:\\/\\/videos-3.earthcam.com\\/fecnetwork\\/27777.flv\\/playlist.m3u8\",\"thumbnail_512\":\"https:\\/\\/static.earthcam.com\\/camshots\\/thumb.jpg\"}," +
                "\"bourbonstreet\":{\"name\":\"Bourbon Street\",\"location\":\"New Orleans, Louisiana, USA\",\"stream\":\"https:\\/\\/videos-3.earthcam.com\\/fecnetwork\\/27777.flv\\/playlist.m3u8\",\"thumbnail_512\":\"https:\\/\\/static.earthcam.com\\/camshots\\/thumb.jpg\"}," +
                "\"abbeyroad_uk\":{\"name\":\"Abbey Road Crossing\",\"location\":\"London, England, UK\",\"stream\":\"https:\\/\\/videos-3.earthcam.com\\/fecnetwork\\/27777.flv\\/playlist.m3u8\",\"thumbnail_512\":\"https:\\/\\/static.earthcam.com\\/camshots\\/thumb.jpg\"}," +
                "\"templebar\":{\"name\":\"Temple Bar\",\"location\":\"Dublin, Ireland\",\"stream\":\"https:\\/\\/videos-3.earthcam.com\\/fecnetwork\\/27777.flv\\/playlist.m3u8\",\"thumbnail_512\":\"https:\\/\\/static.earthcam.com\\/camshots\\/thumb.jpg\"}" +
                "}};" +
                "</script>" +
                "</html>";
        }

        private sealed class StubHttpMessageHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

            public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder)
            {
                _responder = responder;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(_responder(request));
            }
        }
    }
}
