using System.Collections.Generic;
using System.Threading.Tasks;
using SafeGuard.Services.MonitorService.Dto;

namespace SafeGuard.Services.MonitorService
{
    public interface IMonitorAppService
    {
        Task<IReadOnlyList<MonitorCameraDto>> GetStreamsAsync();
        Task<MonitorProxyResult> ProxyAsync(string target, string referer);
    }
}
