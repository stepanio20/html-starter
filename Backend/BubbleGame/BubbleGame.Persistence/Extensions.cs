using BubbleGame.Application.Services.Ton;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Services.Ton;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BubbleGame.Persistence;

public static class Extensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services,
        IConfiguration configuration)
    {
        //services.AddHostedService<DbInitialized>();
        services.AddScoped<ITonService>(provider =>
        {
            var apiUrl = "";
            return new TonService(apiUrl);
        });
        
        return services;
    }
}