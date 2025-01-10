using BubbleGame.Core.Fiats;
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

        var fiat = await _appDbContext.Fiats.FirstOrDefaultAsync(cancellationToken: cancellationToken);
        if (fiat is null)
        {
            fiat = new Fiat()
            {
                UsdtTon = 0
            };
            
            await _appDbContext.Fiats.AddAsync(fiat, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}