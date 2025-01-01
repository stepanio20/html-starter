using System.Text.Json;
using System.Text.Json.Serialization;
using BubbleGame.Application.Services.Players;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using Microsoft.Extensions.Hosting;

namespace BubbleGame.Cache.Services;

public class PlayerGameService(IPlayerUpdateBuffer buffer, ICacheService cache)
    : BackgroundService, IPlayerGameService
{
    private const int _flushInterval = 100;

    public async Task<List<Player>> GetAsync(Guid gameId)
    {
        var nestedPlayers = await cache.GetByKeyAsync<Game>($"game-{gameId}");
        return nestedPlayers.Players;
    }

    public async Task<Player> GetById(Guid gameId, Guid playerId)
    {
        var game = await cache.GetByKeyAsync<Game>($"game-{gameId}");
        return game?.Players?.FirstOrDefault(p => p.Id == playerId) ?? default;
    }

    public async Task<Game> GetGameById(Guid id)
    {
       var game = await cache.GetByKeyAsync<Game>($"game-{gameId}");
       return game;
    }

    public async Task CreateGame(Game game)
    {
        await cache.SaveAsync($"game-{game.Id}", game);
    }
    
    public async Task AddPlayerAsync(Player player)
    {
        try
        {
            var game = await cache.GetByKeyAsync<Game>($"game-{player.GameId}");

            if (game == null)
                throw new InvalidOperationException("Game not found.");

            game.AppendPlayer(player);

            await cache.SaveAsync($"game-{player.GameId}", game);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    public async Task RemovePlayerAsync(Player player)
    {
        var game = await cache.GetByKeyAsync<Game>($"game-{player.GameId}");
        if (game == null)
            throw new InvalidOperationException("Game not found.");

        game.Remove(player.Id); 
        await cache.SaveAsync($"game-{player.GameId}", game);
    }

    
    public void UpdatePlayer(Player player)
    {
        buffer.AddOrUpdatePlayer(player);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_flushInterval, stoppingToken);

            if (buffer.CurrentBufferSize > 0)
                await FlushBufferAsync();
        }
    }

    public async Task FlushBufferAsync()
    {
        var updates = buffer.GetAndClearBuffer();

        var gamesToUpdate = new Dictionary<Guid, Game>();

        foreach (var (gameId, player) in updates)
        {
            if (!gamesToUpdate.TryGetValue(gameId, out var currentGame))
            {
                var gameKey = $"game-{gameId}";

                var game = await cache.GetByKeyAsync<Game>(gameKey);
                if (game == null)
                    return;
                currentGame = game;
                gamesToUpdate[gameId] = currentGame;
            }

            currentGame.UpdatePlayer(player);
        }

        foreach (var game in gamesToUpdate.Values)
        {
            var gameKey = $"game-{game.Id}";
            await cache.SaveAsync(gameKey, game);
        }
    }
}
