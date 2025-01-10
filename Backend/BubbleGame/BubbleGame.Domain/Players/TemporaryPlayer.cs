using BubbleGame.Core.Base;

namespace BubbleGame.Core.Players;

public class TemporaryPlayer : BaseEntity
{
    public string SessionId { get; set; }
    public decimal Amount { get; set; }
}