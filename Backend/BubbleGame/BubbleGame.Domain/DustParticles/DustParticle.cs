using System.Text.Json.Serialization;
using BubbleGame.Core.Base;

namespace BubbleGame.Core.DustParticles;

public class DustParticle : CacheEntity
{
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }
    [JsonPropertyName("PositionX")]
    public float PositionX { get; set; }
    [JsonPropertyName("PositionY")]
    public float PositionY { get; set; }
    [JsonPropertyName("Size")]
    public float Size { get; set; }
}