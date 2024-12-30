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
            options.InstanceName = "MyApp:";         
        });

        services.AddSingleton<IPlayerUpdateBuffer, PlayerUpdateBuffer>();
        return services;
    }
}