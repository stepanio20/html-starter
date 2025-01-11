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
        Console.WriteLine($"Received {request.WalletAddress} - {request.TelegramId}");
        AppUser? user;

        user = await userManager.Users.FirstOrDefaultAsync(x => x.Address.Equals(request.WalletAddress));
        if (user == null)
        {
            user = new AppUser
            {
                TelegramId = request.TelegramId,
                Balance = 0,
                Address = request.WalletAddress ?? string.Empty,
                UserName = request.TelegramId.ToString() ?? request.WalletAddress,
                Email = request.TelegramId.ToString(),
                DemoCoin = 1000
            };
            var res = await userManager.CreateAsync(user);
            if(res.Errors.Any())
                throw new Exception(res.Errors.First().Description);

            return Results.Ok(user.Id);
        }

        if (request.TelegramId == null || request.TelegramId == 0 ||
            (user.TelegramId is not null && user.TelegramId != 0))
            return Results.Ok(user.Id);

        user.TelegramId = request.TelegramId;
        await userManager.UpdateAsync(user);

        return Results.Ok(user.Id);
    }

    private class SignInRequest
    {
        public string WalletAddress { get; set; }
        public long? TelegramId { get; set; }
    }
}