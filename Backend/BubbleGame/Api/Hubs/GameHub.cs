using System.Collections.Concurrent;
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
    public async Task UpdatePlayerPosition(PlayerDto playerDto)
    {
        try
        {
            var gm = await playerGameService.GetGameById(playerDto.GameId);
            if (gm is null)
            {
                await playerGameService.CreateGame(new Game
                {
                    Id = playerDto.GameId
                });
            }

            var player = await playerGameService.GetById(playerDto.GameId, playerDto.PlayerId);
            if (player is null)
            {
                await playerGameService.AddPlayerAsync(new Player //todo
                {
                    Id = playerDto.PlayerId,
                    GameId = playerDto.GameId,
                    UserId = playerDto.PlayerId,
                    PositionX = new Random().Next(1000, 1500),
                    PositionY = new Random().Next(1000, 1500),
                });
                return;
            }

            player.PositionX = playerDto.PositionX;
            player.PositionY = playerDto.PositionY;
            player.LastUpdated = DateTime.UtcNow;

            playerGameService.UpdatePlayer(player);
            var players = await playerGameService.GetAsync(player.GameId);
            foreach (var otherPlayer in players.ToList())
            {
                if (player.Id == otherPlayer.Id) continue;
                
                double distance = Math.Sqrt(
                    Math.Pow(player.PositionX - otherPlayer.PositionX, 2) +
                    Math.Pow(player.PositionY - otherPlayer.PositionY, 2)
                );

                if (distance <= player.Size || distance <= otherPlayer.Size)
                {
                    if (player.Size > otherPlayer.Size)
                    {
                        await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                            new PlayerEatenDto(player.GameId, otherPlayer.Id));

                        player.Size += otherPlayer.Size * 0.1;

                        players.Remove(otherPlayer);
                    }
                    else
                    {
                        await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                            new PlayerEatenDto(otherPlayer.GameId, player.Id));

                        otherPlayer.Size += player.Size * 0.1;

                        players.Remove(player);

                        break; 
                    }
                }
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
}