using BubbleGame.Core.Games;
using BubbleGame.Core.Players;

namespace BubbleGame.Application.Services.Players;

public interface IPlayerService
{
    Task<List<Player>> GetAsync(Guid gameId);
    Task<Player> GetById(string playerId);
    Task AddPlayerAsync(Player player);
    void UpdatePlayer(Player player);
    Task TopUpBalance(Player player);
    Task RemovePlayerAsync(Player id);
}
