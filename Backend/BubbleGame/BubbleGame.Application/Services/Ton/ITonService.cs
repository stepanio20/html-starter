namespace BubbleGame.Application.Services.Ton;

public interface ITonService
{
    Task TransferTonAsync(decimal amount, string recipientAddress);
    Task<string> SendTransactionAsync(string privateKey, string recipientAddress, decimal amount);
}