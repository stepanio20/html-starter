using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BubbleGame.Persistence.DAL;

internal sealed class DbInitialized : IHostedService
{
    private readonly AppDbContext _appDbContext;

    public DbInitialized(IServiceScopeFactory serviceScopeFactory)
    {
        var scope = serviceScopeFactory.CreateScope().ServiceProvider;
        _appDbContext = scope.GetRequiredService<AppDbContext>();
    }
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _appDbContext.Database.MigrateAsync(cancellationToken: cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}