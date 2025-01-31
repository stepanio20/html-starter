namespace BubbleGame.Application.Services.Games;

public interface IGameService
{
    Task<bool> ConnectAsync(string userId, decimal amount, string connectionId);
}