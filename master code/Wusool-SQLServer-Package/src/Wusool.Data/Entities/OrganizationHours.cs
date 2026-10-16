using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class OrganizationHours
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OrganizationId { get; set; } = string.Empty;
    public byte DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public TimeOnly? OpenTime { get; set; }
    public TimeOnly? CloseTime { get; set; }
    public Organization Organization { get; set; } = null!;
}
