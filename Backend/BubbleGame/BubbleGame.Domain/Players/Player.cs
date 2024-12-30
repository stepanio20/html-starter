using BubbleGame.Core.Base;

namespace BubbleGame.Core.Players;

public class Player : BaseEntity
{
    public Guid UserId { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public DateTime LastUpdated { get; set; }
    
    public decimal Size { get; set; }
}