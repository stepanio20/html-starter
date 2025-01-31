using BubbleGame.Core.Games;

namespace BubbleGame.Application.Services.Games;

public interface IRoomService
{
    Task<Room> GetAsync(Guid id);
    Task CreateGame(Room room);
    Task UpdateGame(Room room);
}