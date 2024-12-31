using System.Collections.Concurrent;
using Api.Common.Game;
using Api.Common.Static;
using Api.Common.Static.Sockets;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Players;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

internal sealed class GameHub(IPlayerGameService playerGameService) : Hub
{
    public async Task UpdatePlayerPosition(PlayerDto playerDto)
    {
        var player = await playerGameService.GetById(playerDto.GameId, playerDto.PlayerId);
        player.PositionX = playerDto.PositionX;
        player.PositionY = playerDto.PositionY;
        player.LastUpdated = DateTime.UtcNow;
        
        playerGameService.UpdatePlayer(player);
        
        var players = await playerGameService.GetAsync(player.GameId);
        foreach (var otherPlayer in players)
        {
            if (otherPlayer.Id == player.Id)
                continue; 

            var distance = Math.Sqrt(
                Math.Pow(otherPlayer.PositionX - player.PositionX, 2) +
                Math.Pow(otherPlayer.PositionY - player.PositionY, 2)
            );

            if (!(player.Size > otherPlayer.Size) || !(distance <= player.Size - otherPlayer.Size)) continue;
            await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN, new PlayerEatenDto(player.GameId, otherPlayer.Id));

            await playerGameService.RemovePlayerAsync(otherPlayer);

            player.Size += otherPlayer.Size * 0.1f; 
            playerGameService.UpdatePlayer(player);
        }

        await Clients.All.SendAsync(
            SocketMessages.PLAYER_POSITION_UPDATED, 
            new PlayerDto(player.GameId, player.Id, player.PositionX, player.PositionY, player.Size)
            );
    }
}