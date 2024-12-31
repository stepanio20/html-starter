using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace BubbleGame.Cache;

internal sealed class CacheService(IDistributedCache cache) : ICacheService
{
    public async Task<List<T>> GetAsync<T>(string key)
    {
        var cachedData = await cache.GetStringAsync(key);

        return string.IsNullOrEmpty(cachedData) ? default : JsonSerializer.Deserialize<List<T>>(cachedData);
    }
    
    public async Task<T> GetByKeyAsync<T>(string key)
    {
        var cachedData = await cache.GetStringAsync(key);

        return string.IsNullOrEmpty(cachedData) ? default : JsonSerializer.Deserialize<T>(cachedData);
    }

    public async Task SaveAsync<T>(string key, T value)
    {
        var serializedValue = JsonSerializer.Serialize(value);
        await cache.SetStringAsync(key, serializedValue);
    }
}