using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using StackExchange.Redis;

namespace BubbleGame.Cache;

public static class Extensions
{
    public static IServiceCollection AddCache(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = "localhost:6379";
            options.ConfigurationOptions = new ConfigurationOptions()
            {
                ConnectTimeout = 10000
            };
            options.InstanceName = "BubbleGame.Cache:";         
        });
        
        services.AddSingleton<ICacheService, CacheService>();
        services.AddSingleton<IPlayerUpdateBuffer, PlayerUpdateBuffer>(); 
        services.AddScoped<IPlayerGameService, PlayerGameService>(); 

        services.AddHostedService<PlayerGameService>();

        return services;
    }
}