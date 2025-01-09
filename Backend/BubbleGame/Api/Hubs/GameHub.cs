using System.Collections.Concurrent;
using System.Globalization;
using Api.Common.Dtos.Game;
using Api.Common.Game;
using Api.Common.Static;
using Api.Common.Static.Sockets;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Hubs;

public class GameHub(
    IPlayerGameService playerGameService, 
    UserManager<AppUser> userManager,
    AppDbContext context) : Hub
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

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"];
        var amountString = httpContext?.Request.Query["amount"];
        decimal amount = 0;

        if (string.IsNullOrEmpty(amountString))
        {
            throw new HubException("Amount parameter is missing");
        }

        if (!decimal.TryParse(amountString, NumberStyles.Number, CultureInfo.InvariantCulture, out amount))
        {
            throw new HubException($"Invalid amount value {amountString}");
        }

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userId.ToString()))
            return;


        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new HubException("User not found");

        if (user.Balance < amount)
            throw new HubException("User balance is less than 0");

        var timeNow = DateTime.UtcNow;
        var game = await context.Games.FirstOrDefaultAsync(x => x.EndTime >  timeNow);
        if (game == null)
        {
            game = new Game
            {
                EndTime = timeNow.AddMinutes(5),
                StartTime = timeNow,
            };

            await context.Games.AddAsync(game);
            var cacheGame =  new GameCache
            {
                Id = game.Id
            };
            await playerGameService.CreateGame(cacheGame);
        }

        var player = new Player
        {
            Id = Context.ConnectionId,
            GameId = game.Id,
            UserId = userId.ToString(),
            PositionX = new Random().Next(0, 12000),
            PositionY = new Random().Next(0, 12000),
            Size = amount,
            Color = GetRandomColors().ToLower()
        };

        await playerGameService.AddPlayerAsync(player);

        await Clients.Client(Context.ConnectionId)
            .SendAsync(SocketMessages.CONNECTED,
                new FirstConnectionDto(
                    player.GameId,
                    player.Id,
                    player.PositionX,
                    player.PositionY,
                    player.Size, player.Color, game.EndTime));

        var players = await playerGameService.GetAsync(player.GameId);
        foreach (var otherPlayer in players)
            await Clients.Client(Context.ConnectionId)
                .SendAsync(SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(
                        otherPlayer.GameId,
                        otherPlayer.Id,
                        otherPlayer.PositionX,
                        otherPlayer.PositionY,
                        otherPlayer.Size, player.Color));

        await base.OnConnectedAsync();
    }

    public async Task EatPlayerAsync(string player, string eatenPlayer)
    {
        try
        {
            var currentPlayer = await playerGameService.GetById(player);
            var targetPlayer = await playerGameService.GetById(eatenPlayer);

            if (currentPlayer == null || targetPlayer == null)
                return;

            var distance = Math.Sqrt(
                Math.Pow(currentPlayer.PositionX - targetPlayer.PositionX, 2) +
                Math.Pow(currentPlayer.PositionY - targetPlayer.PositionY, 2)
            );

            var currentRadius = (double)(currentPlayer.Size * 300 / 2);
            var targetRadius = (double)(targetPlayer.Size * 300 / 2);

            if (currentPlayer.Size > targetPlayer.Size)
            {
                var user = await userManager.FindByIdAsync(currentPlayer.UserId);
                if (user == null)
                    throw new HubException("User not found");

                var otherPlayer = await userManager.Users.FirstOrDefaultAsync(x => x.Id == targetPlayer.UserId);
                if (otherPlayer != null)
                {
                    user.Balance += targetPlayer.Size;
                    otherPlayer.Balance -= targetPlayer.Size;
                }

                await playerGameService.RemovePlayerAsync(targetPlayer);
                await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                    new PlayerEatenDto(currentPlayer.GameId, targetPlayer.Id));

                currentPlayer.Size += targetPlayer.Size;
                await playerGameService.TopUpBalance(currentPlayer);
                await userManager.UpdateAsync(user);

                await Clients.All.SendAsync(
                    SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(currentPlayer.GameId, currentPlayer.Id, currentPlayer.PositionX,
                        currentPlayer.PositionY, currentPlayer.Size, currentPlayer.Color)
                );
            }
            else
            {
                var user = await userManager.FindByIdAsync(targetPlayer.UserId);
                if (user == null)
                    throw new HubException("User not found");

                var mainPlayer = await userManager.Users.FirstOrDefaultAsync(x => x.Id == currentPlayer.UserId);
                if (mainPlayer != null)
                {
                    user.Balance += currentPlayer.Size;
                    mainPlayer.Balance -= currentPlayer.Size;
                }

                await playerGameService.RemovePlayerAsync(currentPlayer);
                await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                    new PlayerEatenDto(targetPlayer.GameId, currentPlayer.Id));

                targetPlayer.Size += currentPlayer.Size;
                await playerGameService.TopUpBalance(targetPlayer);
                await userManager.UpdateAsync(user);

                await Clients.All.SendAsync(
                    SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(targetPlayer.GameId, targetPlayer.Id, targetPlayer.PositionX,
                        targetPlayer.PositionY, targetPlayer.Size, currentPlayer.Color)
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during player eat: {ex}");
        }
    }


    public async Task UpdatePlayerPosition(PlayerDto playerDto)
    {
        try
        {
            var player = await playerGameService.GetById(playerDto.PlayerId);
            if (player is null)
                return;

            player.PositionX = playerDto.PositionX;
            player.PositionY = playerDto.PositionY;
            player.LastUpdated = DateTime.UtcNow;

            playerGameService.UpdatePlayer(player);
            await Clients.All.SendAsync(
                SocketMessages.PLAYER_POSITION_UPDATED,
                new PlayerDto(player.GameId, player.Id, player.PositionX, player.PositionY, player.Size, player.Color)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var connectionId = Context.ConnectionId;

            var player = await playerGameService.GetById(connectionId);
            if (player is null)
                return;

            await playerGameService.RemovePlayerAsync(player);

            await Clients.All.SendAsync(SocketMessages.PLAYER_DISCONNECTED, new
            {
                GameId = player.GameId,
                PlayerId = player.Id
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during player disconnection: {ex}");
        }
        finally
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}