using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Routes;

internal static class GameRoute
{
    public static void AddGameRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/games/get-info", GetUserGameInfo).AllowAnonymous();
        app.MapPost("/api/games/get-demo-coin-without-auth", async (string sessionId, AppDbContext _context) =>
        {
            var user = await _context.TemporaryPlayers.FirstOrDefaultAsync(u => u.SessionId.Equals(sessionId));
            if (user == null)
            {
                user = new TemporaryPlayer()
                {
                    SessionId = sessionId,
                    Amount = 1000
                };
                await _context.TemporaryPlayers.AddAsync(user);
                await _context.SaveChangesAsync();
            }
                
            return user.Amount;
        }).AllowAnonymous();
        app.MapPatch("/api/games/update-demo-coin-without-auth", async (string sessionId, decimal amount, AppDbContext _context) =>
        {
            var user = await _context.TemporaryPlayers.FirstOrDefaultAsync(u => u.SessionId.Equals(sessionId));
            if (user == null)
                return Results.Unauthorized();
                
            user.Amount = amount;
            await _context.SaveChangesAsync();
            return Results.Ok();
        }).AllowAnonymous();
        
        app.MapPatch("/api/games/remove-demo-coin-without-auth", async (string sessionId, decimal amount, AppDbContext _context) =>
        {
            var user = await _context.TemporaryPlayers.FirstOrDefaultAsync(u => u.SessionId.Equals(sessionId));
            if (user == null)
                return Results.Unauthorized();
                
            user.Amount -= amount;
            await _context.SaveChangesAsync();
            return Results.Ok();
        }).AllowAnonymous();
        
        app.MapGet("/api/games/get-demo-coin", async (string userId, UserManager<AppUser> userManager) =>
        {
            var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            return user == null ? Results.Unauthorized() : Results.Ok(user.DemoCoin);
        }).AllowAnonymous();

        app.MapPatch("/api/games/update-coin", async (string userId, decimal amount, UserManager<AppUser> userManager) =>
        {
            var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            if (user == null)
                return Results.Unauthorized();

            user.DemoCoin += amount;
            var updateResult = await userManager.UpdateAsync(user);
            return !updateResult.Succeeded ? Results.BadRequest("Failed to update user data.") : Results.Ok(user.DemoCoin);
        }).AllowAnonymous();
        
        app.MapPatch("/api/games/remove-demo-coin", async (string userId, decimal amount, AppDbContext _context) =>
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.Equals(userId));
            if (user == null)
                return Results.Unauthorized();
                
            user.DemoCoin -= amount;
            await _context.SaveChangesAsync();
            return Results.Ok();
        }).AllowAnonymous();
        
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