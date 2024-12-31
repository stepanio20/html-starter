using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Distributed;

namespace BubbleGame.Cache;

internal sealed class CacheService(IDistributedCache cache) : ICacheService
{
    public async Task<List<T>> GetAsync<T>(string key)
    {
        var cachedData = await cache.GetStringAsync(key);

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            IncludeFields = true, 
        };

        return JsonSerializer.Deserialize<List<T>>(cachedData, options) ?? new List<T>();
    }
    
    public async Task<T> GetByKeyAsync<T>(string key)
    {
        var cachedData = await cache.GetStringAsync(key);
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            IncludeFields = true,
            Converters = { new JsonStringEnumConverter() }
        };
        if(string.IsNullOrEmpty(cachedData))
            return default;
        
        return JsonSerializer.Deserialize<T>(cachedData, options) ?? default;
    }

    public async Task SaveAsync<T>(string key, T value)
    {
        var serializedValue = JsonSerializer.Serialize(value, new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,  
            WriteIndented = true                                           
        });
        await cache.SetStringAsync(key, serializedValue);
    }
}