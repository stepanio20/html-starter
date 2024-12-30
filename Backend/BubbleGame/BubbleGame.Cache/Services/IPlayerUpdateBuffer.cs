using BubbleGame.Core.Players;

namespace BubbleGame.Cache.Services;

public interface IPlayerUpdateBuffer
{
    void AddOrUpdatePlayer(string playerId, Player player);
    Dictionary<string, Player> GetAndClearBuffer();
    int CurrentBufferSize { get; }
}