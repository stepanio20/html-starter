using System.Text.Json.Serialization;
using BubbleGame.Core.Base;

namespace BubbleGame.Core.Players;

public class Player
{
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }

    [JsonPropertyName("GameId")]
    public Guid GameId { get; set; }

    [JsonPropertyName("UserId")]
    public Guid UserId { get; set; }

    [JsonPropertyName("PositionX")]
    public float PositionX { get; set; }

    [JsonPropertyName("PositionY")]
    public float PositionY { get; set; }

    [JsonPropertyName("LastUpdated")]
    public DateTime LastUpdated { get; set; }

    [JsonPropertyName("Size")] 
    public double Size { get; set; } = new Random().Next(20, 50);//todo
    // [JsonPropertyName("Color")]
    // public string Color { get; set; }
}