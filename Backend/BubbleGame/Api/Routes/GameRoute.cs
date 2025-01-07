using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Routes;

internal static class GameRoute
{
    public static void AddGameRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/games/get-info", GetUserGameInfo).AllowAnonymous();
    }

    private static async Task<IResult> GetUserGameInfo(GetUserGameInfoRequest getUserGameInfoRequest,  UserManager<AppUser> userManager)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(getUserGameInfoRequest.UserId));
        if (user == null)
            return Results.NotFound();
        
        return Results.Ok(new GetUserGameInfoResponse
        {
            Balance = user.Balance, 
            BallSize = 300
        });
    }
    
    public class GetUserGameInfoRequest
    {
        public string UserId {get; set;}
    }
    
    public class GetUserGameInfoResponse
    {
        public decimal Balance {get; set;}
        public double BallSize { get; set; }
    }
}