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
        var game = await cache.GetByKeyAsync<Game>($"game-{gameId}");
        
        var players = new List<Player>();
        foreach (var playerId in game.Players)
        {
            var player = await cache.GetByKeyAsync<Player>($"player-{playerId}");
            if (player is null)
                continue;
            
            if (player.GameId == gameId)
                players.Add(player);
        }
        return players;
    }
    
    public async Task<Player> GetById(string playerId)
    {
        var player = await cache.GetByKeyAsync<Player>($"player-{playerId}");
        return player;
    }

    public async Task UpdatePlayerSize(Player entity)
    {
        var key = $"player-{entity.Id}";
        await cache.SaveAsync(key, entity);    
    }

    public async Task<Game> GetGameById(Guid id)
    {
       var game = await cache.GetByKeyAsync<Game>($"game-{id}");
       return game;
    }

    public async Task CreateGame(Game game)
    {
        await cache.SaveAsync($"game-{game.Id}", game);
    }

    public async Task DisconnectPlayer(string playerId)
    {
        try
        {

        }
        catch(Exception ex)
        {
            
        }
    }

    public async Task AddPlayerAsync(Player player)
    {
        try
        {
            var game = await cache.GetByKeyAsync<Game>($"game-{player.GameId}");
            if (game == null)
                throw new InvalidOperationException("Game not found.");
            
            game.AppendPlayer(player.Id);
            
            var key = $"player-{player.Id}";
            await cache.SaveAsync(key, player);
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
        var playerKey = $"player-{player.Id}";
        await cache.DeleteAsync(playerKey);
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

        var playersToUpdate = new Dictionary<string, Player>();

        foreach (var player in updates)
        {
            playersToUpdate[player.Key] = player.Value;
        }

        foreach (var player in playersToUpdate.Values)
        {
            var playerKey = $"player-{player.Id}";
            await cache.SaveAsync(playerKey, player);
        }
    }
}
