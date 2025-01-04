using System.Text.Json.Serialization;
using BubbleGame.Core.Base;

namespace BubbleGame.Core.Players;

public class Player : CacheEntity
{
    [JsonPropertyName("Id")]
    public string Id { get; set; }

    [JsonPropertyName("GameId")]
    public Guid GameId { get; set; }

    [JsonPropertyName("UserId")]
    public string UserId { get; set; }

    [JsonPropertyName("PositionX")]
    public float PositionX { get; set; }

    [JsonPropertyName("PositionY")]
    public float PositionY { get; set; }

    [JsonPropertyName("LastUpdated")]
    public DateTime LastUpdated { get; set; }

    [JsonPropertyName("Size")] 
    public decimal Size { get; set; }
    
    [JsonPropertyName("Color")]
    public string Color { get; set; }
}