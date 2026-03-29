using System.Threading.Tasks;
using SafeGuard.Services.ImageAnalysisService;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Incidents;

public class ImageAnalysisService_Tests : SafeGuardTestBase
{
    private readonly IImageAnalysisService _imageAnalysisService;

    public ImageAnalysisService_Tests()
    {
        _imageAnalysisService = Resolve<IImageAnalysisService>();
    }

    [Fact]
    public async Task AnalyzeImageAsync_NullBytes_ShouldReturnNull()
    {
        var result = await _imageAnalysisService.AnalyzeImageAsync(null);

        result.ShouldBeNull();
    }

    [Fact]
    public async Task AnalyzeImageAsync_EmptyBytes_ShouldReturnNull()
    {
        var result = await _imageAnalysisService.AnalyzeImageAsync([]);

        result.ShouldBeNull();
    }

    [Fact]
    public async Task AnalyzeImageAsync_WithEmptyConfig_ShouldReturnNullWithoutCallingApi()
    {
        // The test module registers AzureComputerVisionConfiguration with empty ApiKey/Endpoint,
        // so the service must return null early rather than attempting an API call.
        var result = await _imageAnalysisService.AnalyzeImageAsync(new byte[] { 1, 2, 3 });

        result.ShouldBeNull();
    }
}
