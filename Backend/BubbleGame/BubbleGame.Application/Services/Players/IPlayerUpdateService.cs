using BubbleGame.Core.Players;

namespace BubbleGame.Application.Services.Players;

public interface IPlayerUpdateService
{
    void UpdatePlayer(string playerId, Player player);
    Task FlushBufferAsync();
}