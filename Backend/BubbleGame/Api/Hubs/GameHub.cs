using System.Globalization;
using Api.Common.Dtos.Game;
using Api.Common.Game;
using Api.Common.Static.Sockets;
using BubbleGame.Application.Services.Dusts;
using BubbleGame.Application.Services.Games;
using BubbleGame.Application.Services.Players;
using BubbleGame.Core.DustParticles;
using BubbleGame.Core.GameItems;
using BubbleGame.Core.Games;
using BubbleGame.Core.Players;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Hubs;

public class GameHub(
    IPlayerService playerGameService,
    IRoomService roomGameService,
    IGameItemsService gameItemsService,
    UserManager<AppUser> userManager,
    AppDbContext context) : Hub
{
    private readonly Random Random = new Random();

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

    public async Task CheckPing(long clientTimestamp)
    {
        var serverTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var ping = serverTimestamp - clientTimestamp;

        await Clients.Caller.SendAsync("ReceivePing", ping);
    }
    
    private static readonly Dictionary<Guid, Dictionary<string, Player>> ActivePlayers = new();
    private static readonly Dictionary<Guid, DustParticle> Dusts = new();
    private static readonly Dictionary<Guid, Magnet> Magnets = new();
    private static readonly Dictionary<Guid, Binocular> Binoculars = new();

    private float GetSize()
    {
        return 0;
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"];
        var amountString = httpContext?.Request.Query["amount"];

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(amountString))
            return;

        if (!decimal.TryParse(amountString, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
            throw new HubException($"Invalid amount value {amountString}");

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            throw new HubException("User not found");

        if (user.Balance < amount)
            throw new HubException("Not enough balance");

        var timeNow = DateTime.UtcNow;
        var game = await context.Games
            .Where(x => x.EndTime > timeNow)
            .OrderByDescending(x => x.EndTime)
            .FirstOrDefaultAsync();

        if (game == null)
        {
            game = new Game
            {
                EndTime = timeNow.AddSeconds(40), StartTime = timeNow
            };
            await context.Games.AddAsync(game);
            await context.SaveChangesAsync();
        }

        var gameId = game.Id;
        var playerId = Context.ConnectionId;

        var player = new Player
        {
            Id = playerId,
            GameId = gameId,
            UserId = userId,
            PositionX = new Random().Next(0, 4000),
            PositionY = new Random().Next(0, 4000),
            Deposit = amount,
            Color = GetRandomColors().ToLower()
        };

        if (!ActivePlayers.ContainsKey(gameId))
            ActivePlayers[gameId] = new Dictionary<string, Player>();

        ActivePlayers[gameId][playerId] = player;
        var players = ActivePlayers[gameId];

        var tasks = players.Values.Select(_player =>
            Clients.Client(_player.Id).SendAsync(SocketMessages.CONNECTED,
                new FirstConnectionDto(
                    _player.GameId,
                    _player.Id,
                    _player.PositionX,
                    _player.PositionY,
                    _player.Size,
                    _player.Color,
                    game.EndTime,
                    _player.Deposit,
                    _player.DustCount))
        );

        await Task.WhenAll(tasks);
    
        var tasksForPlayers = players.Values.Select(otherPlayer =>
            Clients.Client(Context.ConnectionId).SendAsync(SocketMessages.PLAYER_POSITION_UPDATED,
                new PlayerDto(
                    otherPlayer.GameId,
                    otherPlayer.Id,
                    otherPlayer.PositionX,
                    otherPlayer.PositionY,
                    otherPlayer.Deposit,
                    otherPlayer.Color,
                    otherPlayer.Size,
                    otherPlayer.DustCount))
        );

        await Task.WhenAll(tasksForPlayers);
        
        var random = new Random();
        var dustDtos = new List<DustParticle>();

        for (var i = 0; i < 3000; i++)
        {
            var dust = new DustParticle
            {
                Id = Guid.NewGuid(),
                PositionX = random.Next(0, 4000),
                PositionY = random.Next(0, 4000),
                Size = 6
            };
            dustDtos.Add(dust);
            Dusts.Add(dust.Id, dust);
        }
        await Clients.Client(Context.ConnectionId).SendAsync(SocketMessages.DUST_UPDATE, dustDtos);
        
        var magnets = new List<Magnet>();
        for (var i = 0; i < 100; i++)
        {
            var magnet = new Magnet()
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                PositionX = random.Next(0, 4000),
                PositionY = random.Next(0, 4000)
            };
            magnets.Add(magnet);
            Magnets.Add(magnet.Id, magnet);
        }

        var magnetDtos = magnets.Select(x => new MagnetDto(x.Id, x.PositionX, x.PositionY)).ToList();
        await Clients.Client(Context.ConnectionId).SendAsync(SocketMessages.MAGNET_CREATED, magnetDtos);
        
        var binoculars = new List<BinocularDto>();
        for (var i = 0; i < 100; i++)
        {
            var binocular = new Binocular()
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                PositionX = random.Next(0, 4000),
                PositionY = random.Next(0, 4000)
            };
            binoculars.Add(new BinocularDto(binocular.Id, binocular.PositionX, binocular.PositionY));
            Binoculars.Add(binocular.Id, binocular);
        }
        
        await Clients.Client(Context.ConnectionId).SendAsync(SocketMessages.BINOCULAR_CREATED, binoculars);
        await base.OnConnectedAsync();
    }    
    public async Task EatDustAsync(string playerId, Guid dustId)
    {
        try
        {
            var currentPlayer = ActivePlayers
                .SelectMany(game => game.Value)
                .FirstOrDefault(pair => pair.Key == playerId)
                .Value;

            var dustExist = Dusts.TryGetValue(dustId, out var dust);
            dust.PositionX = Random.Next(0, 4000);
            dust.PositionY = Random.Next(0, 4000);
            await Clients.All.SendAsync(SocketMessages.DUST_UPDATE, new DustDto(dust.Id.ToString(), dust.PositionX, dust.PositionY));
            
            currentPlayer.Size += dust.Size;
            currentPlayer.DustCount += 1;
        }
        catch (Exception ex)
        {
            //  
        }
    }

    public async Task EatBinocularAsync(string playerId, string binocularId)
    {
        var binocular = await gameItemsService.GetBinocularAsync(binocularId);
        await gameItemsService.RemoveAsync(binocular);
    }
    
    public async Task EatMagnetAsync(string playerId, Guid magnetId)
    {
        var currentPlayer = ActivePlayers
            .SelectMany(game => game.Value)
            .FirstOrDefault(pair => pair.Key == playerId)
            .Value;
        var magnet2 = Magnets.TryGetValue(magnetId, out var magnet) ? magnet : throw new HubException("Magnet not found");

        var nearDusts = Dusts.Values
            .Select(dust => new 
            {
                Dust = dust, 
                Distance = Math.Sqrt(Math.Pow(dust.PositionX - currentPlayer.PositionX, 2) +
                                     Math.Pow(dust.PositionY - currentPlayer.PositionY, 2))
            })
            .OrderBy(d => d.Distance)
            .Take(15)
            .Select(d => d.Dust)
            .ToList();
        
        Magnets.Remove(magnetId);
        
        var updateTasks = nearDusts.Select(nearDust =>
        {
            var random = new Random();
            nearDust.PositionX = random.Next(0, 4000);
            nearDust.PositionY = random.Next(0, 4000);
            return new DustDto(nearDust.Id.ToString(), nearDust.PositionX, nearDust.PositionY);
        });

        await Clients.All.SendAsync(SocketMessages.MAGNET_EATEN, magnet.Id);
        await Clients.All.SendAsync(SocketMessages.DUST_EATEN, updateTasks);
    }

    public async Task EatPlayerAsync(string player, string eatenPlayer)
    {
        try
        {
            var currentPlayer = ActivePlayers
                .FirstOrDefault(g => g.Value.ContainsKey(player)).Value[player];
            var targetPlayer = ActivePlayers
                .FirstOrDefault(g => g.Value.ContainsKey(eatenPlayer)).Value[player];

            if (currentPlayer == null || targetPlayer == null)
                return;

            if (currentPlayer.Size > targetPlayer.Size)
            {
                var user = await userManager.FindByIdAsync(currentPlayer.UserId);
                if (user == null)
                    throw new HubException("User not found");

                var otherPlayer = await userManager.Users.FirstOrDefaultAsync(x => x.Id == targetPlayer.UserId);
                if (otherPlayer != null)
                {
                    user.Balance += targetPlayer.Deposit;
                    otherPlayer.Balance -= targetPlayer.Deposit;
                }
                
                await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                    new PlayerEatenDto(currentPlayer.GameId, targetPlayer.Id));

                currentPlayer.Size += targetPlayer.Size;
                
                var groupKey = ActivePlayers.FirstOrDefault(g => g.Value.ContainsKey(targetPlayer.Id)).Key;

                if (ActivePlayers.TryGetValue(groupKey, out var group))
                {
                    if (group.Remove(eatenPlayer)) 
                    {
                        if (group.Count == 0)
                            ActivePlayers.Remove(groupKey);
                    }
                }
                await userManager.UpdateAsync(user);

                await Clients.All.SendAsync(
                    SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(
                        currentPlayer.GameId,
                        currentPlayer.Id,
                        currentPlayer.PositionX,
                        currentPlayer.PositionY,
                        currentPlayer.Deposit,
                        currentPlayer.Color,
                        currentPlayer.Size,
                        currentPlayer.DustCount)
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
                    user.Balance += currentPlayer.Deposit;
                    mainPlayer.Balance -= currentPlayer.Deposit;
                }
                
                var groupKey = ActivePlayers.FirstOrDefault(g => g.Value.ContainsKey(currentPlayer.Id)).Key;

                if (ActivePlayers.TryGetValue(groupKey, out var group))
                {
                    if (group.Remove(eatenPlayer)) 
                    {
                        if (group.Count == 0)
                            ActivePlayers.Remove(groupKey);
                    }
                }
                
                await Clients.All.SendAsync(SocketMessages.PLAYER_EATEN,
                    new PlayerEatenDto(targetPlayer.GameId, currentPlayer.Id));

                targetPlayer.Size += currentPlayer.Size;
                await userManager.UpdateAsync(user);

                await Clients.All.SendAsync(
                    SocketMessages.PLAYER_POSITION_UPDATED,
                    new PlayerDto(
                        targetPlayer.GameId,
                        targetPlayer.Id,
                        targetPlayer.PositionX,
                        targetPlayer.PositionY,
                        targetPlayer.Deposit,
                        targetPlayer.Color,
                        targetPlayer.Size,
                        targetPlayer.DustCount)
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
        if (!ActivePlayers.ContainsKey(playerDto.GameId) || 
            !ActivePlayers[playerDto.GameId].ContainsKey(playerDto.PlayerId))
            return;

        var player = ActivePlayers[playerDto.GameId][playerDto.PlayerId];

        if ((DateTime.UtcNow - player.LastUpdated).TotalMilliseconds < 50)
            return;

        player.PositionX = playerDto.PositionX;
        player.PositionY = playerDto.PositionY;
        player.LastUpdated = DateTime.UtcNow;

        await Clients.AllExcept(Context.ConnectionId).SendAsync(
            SocketMessages.PLAYER_POSITION_UPDATED, playerDto);
    }


    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var playerId = Context.ConnectionId;
        var gameId = ActivePlayers
            .FirstOrDefault(g => g.Value.ContainsKey(playerId)).Key;

        if (!gameId.Equals(Guid.Empty) && ActivePlayers[gameId].ContainsKey(playerId))
        {
            ActivePlayers[gameId].Remove(playerId);

            if (ActivePlayers[gameId].Count == 0)
                ActivePlayers.Remove(gameId);
        }

        await Clients.All.SendAsync(SocketMessages.PLAYER_DISCONNECTED, new { GameId = gameId, PlayerId = playerId });

        await base.OnDisconnectedAsync(exception);
    }

}