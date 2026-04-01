using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Services.RoadblockService.Dto;

public class GetRoadblocksInput
{
    [Range(-90, 90)]
    public decimal South { get; set; }

    [Range(-180, 180)]
    public decimal West { get; set; }

    [Range(-90, 90)]
    public decimal North { get; set; }

    [Range(-180, 180)]
    public decimal East { get; set; }
}
