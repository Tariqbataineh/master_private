using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class SyncRevision
 {
    public int Id { get; set; }
    public long Version { get; set; } = 0;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
