namespace SafeGuard.Services.RoadblockService.Dto;

public class RoadblockDto
{
    public string Id { get; set; }
    public string Label { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Source { get; set; }
}
