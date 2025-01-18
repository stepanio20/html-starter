namespace BubbleGame.Application.Services.Ton;

public interface ITonService
{
    Task<string> GenerateStartPaymentLink(decimal amount);
    Task TransferTonAsync(decimal amount, string recipientAddress);
    Task ConvertTonAsync(decimal amount);
}