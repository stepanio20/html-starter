using BubbleGame.Core.Base;

namespace BubbleGame.Core.GameItems;

public class Binocular : CacheEntity
{ 
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public float PositionX {get; set;}
    public float PositionY {get; set;}
}