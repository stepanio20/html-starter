using BubbleGame.Core.Players;

namespace BubbleGame.Core.Games;

public class Game
{
    public Guid Id { get; set; }
    public List<Player> Players { get; private set; }

    public void Append(Player player)
    {
        Players.Add(player);
    }

    public void Remove(Guid playerId)
    {
        var player = Players.FirstOrDefault(p => p.Id == playerId);
        if (player is null)
            return;
        
        Players.Remove(player);
    }
}