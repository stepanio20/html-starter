using System.Text;
using System.Text.Json;
using BubbleGame.Application.Services.Ton;


namespace BubbleGame.Persistence.Services.Ton;

internal sealed class TonService(string endpoint) : ITonService
{
    private static readonly HttpClient client = new();
    public async Task TransferTonAsync(decimal amount, string recipientAddress)
    {
        var endpoint = "http://127.0.0.1:8000/withdraw?X_TOKEN=9c79ec24-652b-45ab-9567-bd9c63d6694a";
        var transferData = new
        {
            amount, 
            address = recipientAddress
        };


        var jsonContent = JsonSerializer.Serialize(transferData);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        
        try
        {
            await client.PostAsync(endpoint, content);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Request failed: {ex.Message}");
            throw;
        }
    }
}