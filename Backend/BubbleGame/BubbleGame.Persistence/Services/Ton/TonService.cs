using System.Text;
using System.Text.Json;
using BubbleGame.Application.Services.Ton;


namespace BubbleGame.Persistence.Services.Ton;

internal sealed class TonService(string endpoint) : ITonService
{
    private static readonly HttpClient client = new();

    public async Task<string> GenerateStartPaymentLink(decimal amount)
    {
        try
        {
            var endpoint = "http://199.247.6.31:8002/api/donate";
        var data = new
        {
            amount, 
        };
        var jsonContent = JsonSerializer.Serialize(data);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        
        try
        {
            var res = await client.PostAsync(endpoint, content);
            if (res.IsSuccessStatusCode)
            {
                var responseContent = await res.Content.ReadAsStringAsync();

                var jsonDoc = JsonDocument.Parse(responseContent);
                if (jsonDoc.RootElement.TryGetProperty("invoice_link", out var invoiceLink))
                {
                    return invoiceLink.GetString();
                }

                throw new Exception("'invoice_link' was not found");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Request failed: {ex.Message}");
            throw;
        }
        
        return string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Request failed: {ex.Message}");    
        }
        return string.Empty;
    }
    
    public async Task ConvertTonAsync(decimal amount)
    {
        var endpoint = "https://bot.camelracing.io/convert?X_TOKEN=9c79ec24-652b-45ab-9567-bd9c63d6694a";
        var transferData = new
        {
            amount, 
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
    public async Task TransferTonAsync(decimal amount, string recipientAddress)
    {
        var endpoint = "https://bot.camelracing.io/withdraw?X_TOKEN=9c79ec24-652b-45ab-9567-bd9c63d6694a";
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