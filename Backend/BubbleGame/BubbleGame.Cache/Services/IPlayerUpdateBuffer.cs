using BubbleGame.Core.Players;

namespace BubbleGame.Cache.Services;

public interface IPlayerUpdateBuffer
{
    void AddOrUpdatePlayer(Player player);
    Dictionary<Guid, Player> GetAndClearBuffer();
    int CurrentBufferSize { get; }
}