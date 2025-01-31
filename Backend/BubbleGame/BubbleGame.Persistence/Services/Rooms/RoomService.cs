using BubbleGame.Application.Services.Games;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache;
using BubbleGame.Core.Games;
using Microsoft.Extensions.Hosting;

namespace BubbleGame.Persistence.Services.Games;

public class RoomService(ICacheService cache) : IRoomService
{
    public async Task<Room> GetAsync(Guid id)
    {
        var game = await cache.GetByKeyAsync<Room>(id.ToString());
        return game;
    }

    public async Task CreateGame(Room room)
    {
        await cache.SaveAsync(room.Id.ToString(), room);
    }

    public async Task UpdateGame(Room room)
    {
        await cache.SaveAsync(room.Id.ToString(), room);
    }
}