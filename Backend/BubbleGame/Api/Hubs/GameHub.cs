using System.Collections.Concurrent;
using Api.Common.Dtos.Game;
using Api.Common.Game;
using Api.Common.Static;
using Api.Common.Static.Sockets;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Hubs;

internal sealed class GameHub(IPlayerGameService playerGameService, UserManager<AppUser> userManager) : Hub
{
    private static readonly List<string> Colors =
    [
        "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink",
        "Brown", "Gray", "Black", "Cyan", "Magenta", "Lime"
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

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userId.ToString()))
            return;
        
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new HubException("User not found");
        
        if(user.Balance <= 0)
            throw new HubException("User balance is less than 0");
        
        var gameId = Guid.Parse("f2940113-723e-4339-a32b-49d901b44b6c");
        var gm = await playerGameService.GetGameById(gameId);
        if (gm is null)
        {
            gm = new Game
            {
                Id = gameId
            };
            await playerGameService.CreateGame(gm);
        }

        var player = new Player
        {
            Id = Context.ConnectionId,
            GameId = gm.Id,
            UserId = userId.ToString(),
            PositionX = new Random().Next(1500, 3000),
            PositionY = new Random().Next(1500, 3000),
            Size = user.Balance,
            Color = GetRandomColors().ToLower()
        };

        await playerGameService.AddPlayerAsync(player);

        await Clients.Client(Context.ConnectionId)
            .SendAsync(SocketMessages.CONNECTED,
                new PlayerDto(
                    player.GameId,
                    player.Id,
                    player.PositionX,
                    player.PositionY,
                    player.Size, player.Color));
        
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

    public async Task UpdatePlayerPosition(PlayerDto playerDto)
    {
        try
        {
            var player = await playerGameService.GetById(playerDto.PlayerId);
            if(player is null)
                return;
            
            player.PositionX = playerDto.PositionX;
            player.PositionY = playerDto.PositionY;
            player.LastUpdated = DateTime.UtcNow;

            playerGameService.UpdatePlayer(player);
            var players = await playerGameService.GetAsync(player.GameId);
            foreach (var otherPlayer in players.ToList())
            {
                if (player.Id == otherPlayer.Id) continue;

                var distance = Math.Sqrt(
                    Math.Pow(player.PositionX - otherPlayer.PositionX, 2) +
                    Math.Pow(player.PositionY - otherPlayer.PositionY, 2)
                );

                if (!((decimal)distance <= player.Size * 1500) && !((decimal)distance <= otherPlayer.Size * 1500))
                    continue;

                if (player.Size > otherPlayer.Size)
                {
                    var user = await userManager.FindByIdAsync(player.UserId); 
                    if (user is null)
                        throw new HubException("User not found");
                    
                    var other_player = await userManager.Users.FirstOrDefaultAsync(x => x.Id == otherPlayer.UserId);
                    if (other_player is not null)
                        other_player.Balance = 0;
                    
                    await playerGameService.RemovePlayerAsync(otherPlayer);

                    await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                        new PlayerEatenDto(player.GameId, otherPlayer.Id));

                    player.Size += otherPlayer.Size;
                    user.Balance += player.Size;
                    players.Remove(otherPlayer);
                    await playerGameService.TopUpBalance(player);
                    await userManager.UpdateAsync(user);
                    await Clients.All.SendAsync(
                        SocketMessages.PLAYER_POSITION_UPDATED,
                        new PlayerDto(player.GameId, player.Id, player.PositionX, player.PositionY, player.Size, player.Color)
                    );
                }
                else
                {
                    var user = await userManager.FindByIdAsync(otherPlayer.UserId); 
                    if (user is null)
                        throw new HubException("User not found");
                    
                    var main_player = await userManager.Users.FirstOrDefaultAsync(x => x.Id == player.UserId);
                    if (main_player is not null)
                        main_player.Balance = 0;
                    await playerGameService.RemovePlayerAsync(player);

                    await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                        new PlayerEatenDto(otherPlayer.GameId, player.Id));

                    otherPlayer.Size += player.Size;
            
                    players.Remove(player);
                    await playerGameService.TopUpBalance(otherPlayer);
                    user.Balance += player.Size;

                    await userManager.UpdateAsync(user);
                    await Clients.All.SendAsync(
                        SocketMessages.PLAYER_POSITION_UPDATED,
                        new PlayerDto(otherPlayer.GameId, otherPlayer.Id, otherPlayer.PositionX, otherPlayer.PositionY,
                            otherPlayer.Size, player.Color)
                    );
                }

                return;
            }

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