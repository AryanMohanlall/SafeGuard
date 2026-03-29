using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Dependency;
using Azure;
using Azure.AI.Vision.ImageAnalysis;

namespace SafeGuard.Services.ImageAnalysisService;

public class ImageAnalysisService : IImageAnalysisService, ITransientDependency
{
    private readonly AzureComputerVisionConfiguration _config;

    public ImageAnalysisService(AzureComputerVisionConfiguration config)
    {
        _config = config;
    }

    public async Task<string> AnalyzeImageAsync(byte[] imageBytes)
    {
        if (imageBytes == null || imageBytes.Length == 0)
            return null;

        if (string.IsNullOrWhiteSpace(_config.ApiKey) || string.IsNullOrWhiteSpace(_config.Endpoint))
            return null;

        try
        {
            var client = new ImageAnalysisClient(new Uri(_config.Endpoint), new AzureKeyCredential(_config.ApiKey));

            var result = await client.AnalyzeAsync(
                BinaryData.FromBytes(imageBytes),
                VisualFeatures.Objects | VisualFeatures.Tags
            );

            var detectedItems = new List<object>();

            if (result.Value.Objects?.Values != null)
            {
                foreach (var obj in result.Value.Objects.Values)
                {
                    detectedItems.Add(new
                    {
                        name = obj.Tags[0].Name,
                        confidence = Math.Round(obj.Tags[0].Confidence, 2),
                        source = "object"
                    });
                }
            }

            if (result.Value.Tags?.Values != null)
            {
                foreach (var tag in result.Value.Tags.Values)
                {
                    detectedItems.Add(new
                    {
                        name = tag.Name,
                        confidence = Math.Round(tag.Confidence, 2),
                        source = "tag"
                    });
                }
            }

            return JsonSerializer.Serialize(detectedItems);
        }
        catch
        {
            return null;
        }
    }
}
