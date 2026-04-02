using System;

namespace SafeGuard.Services.MonitorService
{
    public class MonitorProxyResult
    {
        public int StatusCode { get; set; }
        public string ContentType { get; set; } = "application/octet-stream";
        public byte[] Body { get; set; } = Array.Empty<byte>();
        public string ErrorMessage { get; set; }
    }
}
