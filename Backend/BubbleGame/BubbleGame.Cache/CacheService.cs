using Microsoft.Extensions.Caching.Distributed;

namespace BubbleGame.Cache;

internal sealed class CacheService(IDistributedCache cache) : ICacheService
{
    public async Task SavaAsync<T>(string key, string value)
    {
        await cache.SetStringAsync($"player:{key}", value);
    }
}