using BubbleGame.Core.Games;
using BubbleGame.Core.Players;

namespace BubbleGame.Application.Services.Players;

public interface IPlayerGameService
{
    Task<List<Player>> GetAsync(Guid gameId);
    Task<Player> GetById(string playerId);
    Task AddPlayerAsync(Player player);
    void UpdatePlayer(Player player);
    Task TopUpBalance(Player player);
    Task<GameCache> GetGameById(Guid id);
    Task RemovePlayerAsync(Player id);
    Task CreateGame(GameCache gameCache);
    Task DisconnectPlayer(string playerId);
    Task FlushBufferAsync();
}
