using System.Text.Json.Serialization;
using BubbleGame.Core.Base;
using BubbleGame.Core.Players;

namespace BubbleGame.Core.Games;

public class Game : CacheEntity
{
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }

    [JsonPropertyName("Players")]
    public List<string> Players { get; set; } = new List<string>();

    public void AppendPlayer(string playerId)
    {
        Players.Add(playerId);
    }

    public void Remove(string playerId)
    {
        var player = Players.FirstOrDefault(p => p.Equals(playerId));
        if (player is null)
            return;
        
        Players.Remove(player);
    }
}