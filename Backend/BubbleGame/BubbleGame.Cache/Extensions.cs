using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.StackExchangeRedis;

namespace BubbleGame.Cache;

public static class Extensions
{
    public static IServiceCollection AddCache(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = "localhost:6379"; 
            options.InstanceName = "BubbleGame.Cache:";         
        });
        
        services.AddScoped<ICacheService, CacheService>();
        services.AddSingleton<IPlayerUpdateBuffer, PlayerUpdateBuffer>();
        services.AddScoped<IPlayerUpdateService, PlayerUpdateService>();
        
        services.AddHostedService<PlayerUpdateService>();

        return services;
    }
}