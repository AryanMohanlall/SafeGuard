using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeGuard.Controllers;
using SafeGuard.Services.MonitorService;

namespace SafeGuard.Web.Host.Controllers
{
    [AllowAnonymous]
    [Route("api/monitor")]
    public class MonitorController : SafeGuardControllerBase
    {
        private readonly IMonitorAppService _monitorAppService;

        public MonitorController(IMonitorAppService monitorAppService)
        {
            _monitorAppService = monitorAppService;
        }

        [HttpGet("streams")]
        public async Task<IActionResult> Streams()
        {
            var cameras = await _monitorAppService.GetStreamsAsync();

            Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";

            if (cameras.Count == 0)
            {
                return StatusCode(503, new { message = "No live cameras could be resolved right now." });
            }

            return Ok(new { cameras });
        }

        [HttpGet("proxy")]
        public async Task<IActionResult> Proxy([FromQuery] string target, [FromQuery] string referer)
        {
            var result = await _monitorAppService.ProxyAsync(target, referer);

            Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";

            if (!string.IsNullOrWhiteSpace(result.ErrorMessage))
            {
                return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
            }

            if (result.StatusCode != 200)
            {
                return StatusCode(result.StatusCode);
            }

            return File(result.Body, result.ContentType);
        }
    }
}
