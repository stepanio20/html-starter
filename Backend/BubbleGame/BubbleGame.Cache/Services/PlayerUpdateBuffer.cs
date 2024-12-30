using System.Collections.Concurrent;
using BubbleGame.Core.Players;

namespace BubbleGame.Cache.Services;

internal sealed class PlayerUpdateBuffer : IPlayerUpdateBuffer
{
    private readonly ConcurrentDictionary<string, Player> _buffer = new();
    private const int _maxBufferSize = 100;
    private readonly Lock _lock = new();

    public void AddOrUpdatePlayer(string playerId, Player player)
    {
        lock (_lock)
        {
            _buffer[playerId] = player;

            if (_buffer.Count >= _maxBufferSize)
            {
                FlushBuffer();
            }
        }
    }

    public Dictionary<string, Player> GetAndClearBuffer()
    {
        lock (_lock)
        {
            var toFlush = new Dictionary<string, Player>(_buffer);
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