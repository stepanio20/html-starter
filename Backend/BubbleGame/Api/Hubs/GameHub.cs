using System.Collections.Concurrent;
using Api.Common.Game;
using Api.Common.Static;
using BubbleGame.Application.Services.Players;
using BubbleGame.Cache.Services;
using BubbleGame.Core.Players;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

internal sealed class GameHub(IPlayerUpdateService playerUpdateService) : Hub
{
    public async Task UpdatePlayerPosition(string playerId, float x, float y)
    {
        var player = new Player
        {
            PositionX = x,
            PositionY = y,
            LastUpdated = DateTime.UtcNow,
        };

        playerUpdateService.UpdatePlayer(playerId, player);

        await Clients.All.SendAsync(SocketNamespaces.PLAYER_POSITION_UPDATED, new PlayerDto(player.Id, x, y, 1));
    }
}