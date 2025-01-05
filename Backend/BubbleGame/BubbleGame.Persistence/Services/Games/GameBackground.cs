using BubbleGame.Cache;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BubbleGame.Persistence.Services.Games;

public class GameBackgroundService : BackgroundService
{
    private readonly AppDbContext _appDbContext;
    private readonly ICacheService _cacheService;

    public GameBackgroundService(IServiceScopeFactory serviceScopeFactory)
    {
        var scope = serviceScopeFactory.CreateScope().ServiceProvider;
        _appDbContext = scope.GetRequiredService<AppDbContext>();
        _cacheService = scope.GetRequiredService<ICacheService>();
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var games = await _appDbContext.PlayRooms.ToListAsync(cancellationToken: stoppingToken);

                foreach (var game in games)
                {
                    var cacheGame = await _cacheService.GetByKeyAsync<Game>($"game-{game.Id}");
                    if (cacheGame is null)
                        continue;
                    
                    var now = DateTime.UtcNow;

                    foreach (var cachePlayer in cacheGame.Players)
                    {
                        var player = await _cacheService.GetByKeyAsync<Player>($"player-{cachePlayer}");
                        if(player is null)
                            continue;
                        
                        if (player.LastUpdated < now.AddSeconds(-15))
                            cacheGame.Remove(player.Id);
                    }
                    await _cacheService.SaveAsync($"game-{cacheGame.Id}", cacheGame);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);//todo log
            }
        }
    
    }
}