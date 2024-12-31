using System.Text.Json.Serialization;
using BubbleGame.Core.Players;

namespace BubbleGame.Core.Games;

public class Game
{
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }

    [JsonPropertyName("Players")]
    public List<Player> Players { get; set; } = new List<Player>();

    public void AppendPlayer(Player player)
    {
        Players.Add(player);
    }

    public void UpdatePlayer(Player entity)
    {
        var player = Players.FirstOrDefault(p => p.Id == entity.Id);
        if (player is null)
            return;
        
        player.PositionY = entity.PositionY;
        player.PositionX = entity.PositionX;
        player.Size = entity.Size;
        player.LastUpdated = DateTime.UtcNow;
    }

    public void Remove(Guid playerId)
    {
        var player = Players.FirstOrDefault(p => p.Id == playerId);
        if (player is null)
            return;
        
        Players.Remove(player);
    }
}