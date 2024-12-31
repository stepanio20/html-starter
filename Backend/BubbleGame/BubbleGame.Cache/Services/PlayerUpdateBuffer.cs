using System.Collections.Concurrent;
using BubbleGame.Core.Players;

namespace BubbleGame.Cache.Services;

internal sealed class PlayerUpdateBuffer : IPlayerUpdateBuffer
{
    private readonly ConcurrentDictionary<Guid ,Player> _buffer = new();
    private const int _maxBufferSize = 100;
    private readonly Lock _lock = new();

    public void AddOrUpdatePlayer(Player player)
    {
        lock (_lock)
        {
            _buffer[player.Id] = player;

            if (_buffer.Count >= _maxBufferSize)
            {
                FlushBuffer();
            }
        }
    }

    public Dictionary<Guid, Player> GetAndClearBuffer()
    {
        lock (_lock)
        {
            var toFlush = new Dictionary<Guid, Player>(_buffer);
            _buffer.Clear();
            return toFlush;
        }
    }

    private void FlushBuffer()
    {
        var toFlush = GetAndClearBuffer();
    }

    public int CurrentBufferSize => _buffer.Count;
}