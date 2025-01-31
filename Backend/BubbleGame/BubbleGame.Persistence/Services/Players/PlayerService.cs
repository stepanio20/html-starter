using BubbleGame.Application.Services.Players;
using BubbleGame.Cache;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using Microsoft.Extensions.Hosting;

namespace BubbleGame.Persistence.Services.Players;

public class PlayerService(IPlayerUpdateBuffer buffer, ICacheService cache)
    : BackgroundService, IPlayerService
{
    private const int _flushInterval = 100;

    public async Task<List<Player>> GetAsync(Guid gameId)
    {
        var game = await cache.GetByKeyAsync<Room>(gameId.ToString());
        if (game is null)
            return [];
        var players = new List<Player>();
        foreach (var playerId in game.Players)
        {
            var player = await cache.GetByKeyAsync<Player>(playerId);
            if (player is null)
                continue;
            
            if (player.GameId == gameId)
                players.Add(player);
        }
        return players;
    }

    public async Task<Player> GetById(string playerId)
    {
        var player = await cache.GetByKeyAsync<Player>(playerId);
        return player;
    }

    public async Task TopUpBalance(Player entity)
    {
        var key = entity.Id;
        await cache.SaveAsync(key, entity);    
    }

    public async Task AddPlayerAsync(Player player)
    {
        try
        {
            var game = await cache.GetByKeyAsync<Room>(player.GameId.ToString());
            if (game == null)
                throw new InvalidOperationException("Game not found.");
            
            game.AppendPlayer(player.Id);
            
            var key = player.Id;
            await cache.SaveAsync(player.GameId.ToString(), game);
            await cache.SaveAsync(key, player);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    public async Task RemovePlayerAsync(Player player)
    {
        var game = await cache.GetByKeyAsync<Room>(player.GameId.ToString());
        if (game == null)
            throw new InvalidOperationException("Game not found.");
        
        game.Remove(player.Id); 
        await cache.SaveAsync(player.GameId.ToString(), game);
        var playerKey = player.Id;
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

    private async Task FlushBufferAsync()
    {
        var updates = buffer.GetAndClearBuffer();

        var playersToUpdate = new Dictionary<string, Player>();

        foreach (var player in updates)
            playersToUpdate[player.Key] = player.Value;

        foreach (var player in playersToUpdate.Values)
        {
            var playerKey = player.Id;
            await cache.SaveAsync(playerKey, player);
        }
    }
}
