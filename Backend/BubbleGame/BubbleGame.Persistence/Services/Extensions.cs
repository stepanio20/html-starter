using BubbleGame.Application.Services.Dusts;
using BubbleGame.Application.Services.Games;
using BubbleGame.Application.Services.Players;
using BubbleGame.Persistence.Services.Dusts;
using BubbleGame.Persistence.Services.Players;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BubbleGame.Persistence.Services;

public static class Extensions
{
    public static IServiceCollection AddServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = "199.247.6.31:6379";
            options.InstanceName = "BubbleGame.Cache:";
        });
            
        services.AddScoped<IPlayerService, PlayerService>();
        services.AddScoped<IRoomService, Games.RoomService>();
        services.AddScoped<IGameItemsService, GameItemsService>();
        services.AddHostedService<PlayerService>();

        return services;
    }
}