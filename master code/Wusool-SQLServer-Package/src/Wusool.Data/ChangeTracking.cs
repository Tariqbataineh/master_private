using Microsoft.EntityFrameworkCore;
namespace Wusool.Data;
public sealed partial class WusoolDbContext
{
    private void StampChanges()
    {
        ChangeTracker.DetectChanges();
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries().Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            if (entry.Metadata.FindProperty("Revision") is not null)
            {
                var property = entry.Property("Revision");
                if (entry.State == EntityState.Added) property.CurrentValue = 1;
                else property.CurrentValue = checked((int)property.OriginalValue! + 1);
            }
            if (entry.Metadata.FindProperty("UpdatedAt") is not null) entry.Property("UpdatedAt").CurrentValue = now;
            if (entry.State == EntityState.Added && entry.Metadata.FindProperty("CreatedAt") is not null)
                entry.Property("CreatedAt").CurrentValue = now;
        }
    }
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        StampChanges();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}
