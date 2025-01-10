using Api.Common.Static.Sockets;
using Api.Hubs;
using BubbleGame.Cache;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Backgrounds;

public class PlayerLastUpdateBackgroundService : BackgroundService
{
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly ICacheService _cacheService;
    
    private readonly IServiceProvider _serviceProvider;

    public PlayerLastUpdateBackgroundService(IServiceScopeFactory serviceScopeFactory)
    {
        _serviceProvider = serviceScopeFactory.CreateScope().ServiceProvider;

        _context = _serviceProvider.GetRequiredService<AppDbContext>();
        _userManager = _serviceProvider.GetRequiredService<UserManager<AppUser>>();
        _cacheService = _serviceProvider.GetRequiredService<ICacheService>();
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var hubContext = _serviceProvider.GetRequiredService<IHubContext<GameHub>>();

                var timeNow = DateTime.UtcNow;
                var games = await _context.Games.Where(x => x.EndTime > timeNow)
                    .ToListAsync(cancellationToken: stoppingToken);

                foreach (var game in games)
                {
                    var cacheGame = await _cacheService.GetByKeyAsync<GameCache>($"game-{game.Id}");

                    var players = new List<Player>();
                    foreach (var playerId in cacheGame.Players)
                    {
                        var player = await _cacheService.GetByKeyAsync<Player>($"player-{playerId}");
                        if (player is null)
                            continue;

                        if (player.GameId == game.Id && player.LastUpdated < timeNow.AddSeconds(-15))
                            players.Add(player);
                    }

                    foreach (var player in players)
                    {
                        await _cacheService.DeleteAsync("player-" + player.Id);
                        await hubContext.Clients.All.SendAsync(
                            SocketMessages.PLAYER_DISCONNECTED,
                            new { GameId = player.GameId, PlayerId = player.Id },
                            stoppingToken
                        );
                    }
                }

                await Task.Delay(1000, stoppingToken);
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}