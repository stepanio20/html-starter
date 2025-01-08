using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Routes;

internal static class GameRoute
{
    public static void AddGameRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/games/get-info", GetUserGameInfo).AllowAnonymous();
        app.MapGet("/api/games/get-demo-coin", async (Guid userId, UserManager<AppUser> userManager) =>
        {
            var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            if (user == null)
                return Results.Unauthorized();  // Возвращаем ошибку, если пользователь не найден

            return Results.Ok(user.DemoCoin);  // Возвращаем количество монет в ответе
        }).AllowAnonymous();

        app.MapPatch("/api/games/update-coin", async (Guid userId, decimal amount, UserManager<AppUser> userManager) =>
        {
            var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            if (user == null)
                return Results.Unauthorized();  // Возвращаем ошибку, если пользователь не найден

            user.DemoCoin += amount;  // Обновляем количество монет
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Results.BadRequest("Failed to update user data.");  // Возвращаем ошибку, если обновление не удалось

            return Results.Ok(user.DemoCoin);  // Возвращаем обновленное количество монет
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