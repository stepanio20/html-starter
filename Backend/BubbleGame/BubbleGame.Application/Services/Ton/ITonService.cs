namespace BubbleGame.Application.Services.Ton;

public interface ITonService
{
    Task<string> SendTransactionAsync(string privateKey, string recipientAddress, decimal amount);
}