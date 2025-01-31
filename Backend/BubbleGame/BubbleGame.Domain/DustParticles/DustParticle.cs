using BubbleGame.Core.Base;

namespace BubbleGame.Core.DustParticles;

public class DustParticle : CacheEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float Size { get; set; }
}