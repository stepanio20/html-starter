using BubbleGame.Core.Games;
using BubbleGame.Core.Players;

namespace BubbleGame.Application.Services.Players;

public interface IPlayerGameService
{
    Task<List<Player>> GetAsync(Guid gameId);
    Task<Player> GetById(Guid gameId, Guid playerId);
    Task AddPlayerAsync(Player player);
    void UpdatePlayer(Player player);
    Task RemovePlayerAsync(Player id);
    Task CreateGame(Game game);
    Task FlushBufferAsync();
}