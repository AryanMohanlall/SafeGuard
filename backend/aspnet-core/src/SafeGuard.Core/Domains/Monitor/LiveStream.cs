using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;

namespace SafeGuard.Domains.Monitor
{
    public class LiveStream : FullAuditedEntity<Guid>
    {
        [Required]
        [MaxLength(256)]
        public string Name { get; set; }

        [Required]
        [MaxLength(512)]
        public string Location { get; set; }

        [Required]
        [MaxLength(128)]
        public string SourceName { get; set; }

        [Required]
        [MaxLength(2048)]
        public string SourceUrl { get; set; }

        [Required]
        [MaxLength(256)]
        public string CamKey { get; set; }

        [MaxLength(2048)]
        public string ThumbnailUrl { get; set; }

        public bool IsActive { get; set; }

        [Range(0, 1000)]
        public int SortOrder { get; set; }
    }
}
