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
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.Address.Equals(request.WalletAddress));
        return user == null ? Results.Unauthorized() : Results.Ok(user.Id);
    }

    private class SignInRequest
    {
        public string WalletAddress { get; set; }
    }
}