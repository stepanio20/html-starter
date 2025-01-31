using BubbleGame.Application.Services.Dusts;
using BubbleGame.Application.Services.Games;
using BubbleGame.Application.Services.Players;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BubbleGame.Persistence.Services.Games;

public class CustomException(string exception) : Exception
{
    
}

internal sealed class GameService(
    UserManager<AppUser> userManager,
    AppDbContext context,
    IRoomService roomService,
    IPlayerService playerService,
    IDustService dustService)
    : IGameService
{
    private static readonly List<string> Colors =
    [
        "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink"
    ];

    private static string GetRandomColors()
    {
        var random = new Random();
        var index = random.Next(Colors.Count);
        return Colors[index];
    }
    
    public async Task<bool> ConnectAsync(string userId, decimal amount, string connectionId)
    {
        var firstInRoom = false;

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new CustomException("User not found");

        if (user.Balance < amount)
            throw new CustomException("User balance is less than 0");

        var timeNow = DateTime.UtcNow;
        var game = await context.Games.FirstOrDefaultAsync(x => x.EndTime > timeNow);
        Room? cacheGame;
        if (game == null)
        {
            game = new Game
            {
                EndTime = timeNow.AddMinutes(5),
                StartTime = timeNow,
            };

            await context.Games.AddAsync(game);
            cacheGame = new Room
            {
                Id = game.Id
            };
            await roomService.CreateGame(cacheGame);
            await dustService.GenerateAsync();
            await context.SaveChangesAsync();
            firstInRoom = true;
        }
        else
        {
            cacheGame = await roomService.GetAsync(game.Id);
            if (cacheGame is not null && cacheGame.Players.Count < 1)
                firstInRoom = true;
        }
        var player = new Player
        {
            Id = connectionId,
            GameId = game.Id,
            UserId = userId.ToString(),
            PositionX = new Random().Next(0, 12000),
            PositionY = new Random().Next(0, 12000),
            Size = amount,
            Color = GetRandomColors().ToLower()
        };

        await playerService.AddPlayerAsync(player);

        return firstInRoom;
    }
}