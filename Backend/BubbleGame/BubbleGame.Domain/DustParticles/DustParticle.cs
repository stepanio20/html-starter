using BubbleGame.Core.Base;

namespace BubbleGame.Core.DustParticles;

public class DustParticle : CacheEntity
{
    public Guid Id { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float Size { get; set; }
}