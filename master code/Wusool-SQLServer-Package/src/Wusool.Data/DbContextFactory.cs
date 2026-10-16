using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace Wusool.Data;

public sealed class DbContextFactory : IDesignTimeDbContextFactory<WusoolDbContext>
{
    public WusoolDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("WUSOOL_CONNECTION_STRING")
            ?? throw new InvalidOperationException("Set WUSOOL_CONNECTION_STRING using an environment variable; do not commit credentials.");
        var options = new DbContextOptionsBuilder<WusoolDbContext>()
            .UseSqlServer(connection, sql => sql.EnableRetryOnFailure())
            .Options;
        return new WusoolDbContext(options);
    }
}
