using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Routes;

internal static class AuthRoute
{
    public static void AddAuthRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/sign-in", SignInAsync);
    }

    private static async Task<IResult> SignInAsync([FromBody] SignInRequest request, UserManager<AppUser> userManager)
    {
        AppUser? user;
        if (request.TelegramId is not null)
        {
            user = await userManager.Users.FirstOrDefaultAsync(x => x.TelegramId.Equals(request.TelegramId));
            if (user == null)
            {
                user = new AppUser
                {
                    TelegramId = request.TelegramId,
                    Balance = 0,
                    Address = ""
                };
                await userManager.CreateAsync(user);

                return Results.Unauthorized();
            }
            
            if(string.IsNullOrEmpty(user.Address) && string.IsNullOrEmpty(request.WalletAddress))
                return Results.Unauthorized();
            
            user.Address = request.WalletAddress;
            await userManager.UpdateAsync(user);
            return Results.Ok(user.Id);
        }
           
        user = await userManager.Users.FirstOrDefaultAsync(x => x.Address.Equals(request.WalletAddress));
        return user == null ? Results.Unauthorized() : Results.Ok(user.Id);
    }

    private class SignInRequest
    {
        public string WalletAddress { get; set; }
        public int? TelegramId { get; set; }
    }
}