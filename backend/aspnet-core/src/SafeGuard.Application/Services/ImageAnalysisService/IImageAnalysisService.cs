using System.Threading.Tasks;

namespace SafeGuard.Services.ImageAnalysisService;

public interface IImageAnalysisService
{
    /// <summary>
    /// Analyzes an image using Azure Computer Vision and returns detected objects as a JSON string.
    /// Returns null if no image is provided or the service is not configured.
    /// </summary>
    Task<string> AnalyzeImageAsync(byte[] imageBytes);
}
