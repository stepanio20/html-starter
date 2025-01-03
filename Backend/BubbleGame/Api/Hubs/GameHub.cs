using System.Collections.Concurrent;
using Api.Common.Dtos.Game;
using Api.Common.Game;
using Api.Common.Static;
using Api.Common.Static.Sockets;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

internal sealed class GameHub(IPlayerGameService playerGameService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"];

        if (string.IsNullOrEmpty(userId))
            return;

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
            UserId = Guid.NewGuid(),
            PositionX = new Random().Next(1000, 1500),
            PositionY = new Random().Next(1000, 1500),
        };

        await playerGameService.AddPlayerAsync(player);

        await Clients.Client(Context.ConnectionId)
            .SendAsync(SocketMessages.CONNECTED,
                new PlayerDto(
                    player.GameId,
                    player.Id,
                    player.PositionX,
                    player.PositionY,
                    player.Size));
        
        var players = await playerGameService.GetAsync(player.GameId);
        foreach (var otherPlayer in players)
            await Clients.Client(Context.ConnectionId)
                .SendAsync(SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(
                        otherPlayer.GameId,
                        otherPlayer.Id,
                        otherPlayer.PositionX,
                        otherPlayer.PositionY,
                        otherPlayer.Size));
        
        await base.OnConnectedAsync();
    }

    public async Task UpdatePlayerPosition(PlayerDto playerDto)
    {
        try
        {
            var player = await playerGameService.GetById(playerDto.PlayerId);

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

                if (!(distance <= player.Size) && !(distance <= otherPlayer.Size))
                    continue;

                if (player.Size > otherPlayer.Size)
                {
                    await playerGameService.RemovePlayerAsync(otherPlayer);

                    await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                        new PlayerEatenDto(player.GameId, otherPlayer.Id));

                    player.Size += otherPlayer.Size;

                    players.Remove(otherPlayer);
                    await playerGameService.UpdatePlayerSize(player);
                    await Clients.All.SendAsync(
                        SocketMessages.PLAYER_POSITION_UPDATED,
                        new PlayerDto(player.GameId, player.Id, player.PositionX, player.PositionY, player.Size)
                    );
                }
                else
                {
                    await playerGameService.RemovePlayerAsync(player);

                    await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                        new PlayerEatenDto(otherPlayer.GameId, player.Id));

                    otherPlayer.Size += player.Size;

                    players.Remove(player);
                    await playerGameService.UpdatePlayerSize(otherPlayer);
                    await Clients.All.SendAsync(
                        SocketMessages.PLAYER_POSITION_UPDATED,
                        new PlayerDto(otherPlayer.GameId, otherPlayer.Id, otherPlayer.PositionX, otherPlayer.PositionY,
                            otherPlayer.Size)
                    );
                }

                return;
            }

            await Clients.All.SendAsync(
                SocketMessages.PLAYER_POSITION_UPDATED,
                new PlayerDto(player.GameId, player.Id, player.PositionX, player.PositionY, player.Size)
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

            await Clients.All.SendAsync(SocketMessages.PLAYER_DISCONNECTED, new { player.GameId, player.Id });
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