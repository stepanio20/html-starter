namespace BubbleGame.Application.Services.Ton;

public interface ITonService
{
    Task TransferTonAsync(decimal amount, string recipientAddress);
}