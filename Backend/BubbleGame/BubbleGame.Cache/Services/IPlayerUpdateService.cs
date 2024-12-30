using BubbleGame.Core.Players;

namespace BubbleGame.Cache.Services;

public interface IPlayerUpdateService
{
    void UpdatePlayer(string playerId, Player player);
    Task FlushBufferAsync();
}