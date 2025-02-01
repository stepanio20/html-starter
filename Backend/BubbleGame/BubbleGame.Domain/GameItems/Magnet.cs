using System.Text.Json.Serialization;
using BubbleGame.Core.Base;

namespace BubbleGame.Core.GameItems;

public class Magnet : CacheEntity
{
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("GameId")]
    public Guid GameId { get; set; }
    
    [JsonPropertyName("PositionX")]
    public int PositionX { get; set; }
    
    [JsonPropertyName("PositionY")]
    public int PositionY { get; set; }
}