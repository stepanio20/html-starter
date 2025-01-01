using System.Text;
using BubbleGame.Application.Services.Ton;
using Newtonsoft.Json;

namespace BubbleGame.Persistence.Services.Ton;

internal sealed class TonService(string endpoint) : ITonService
{
    public async Task<string> SendTransactionAsync(string privateKey, string recipientAddress, decimal amount)
    {
        using var client = new HttpClient();

        var requestData = new
        {
            jsonrpc = "2.0",
            id = 1,
            method = "sendTransaction",
            @params = new
            {
                fromPrivateKey = privateKey,
                toAddress = recipientAddress,
                value = (ulong)(amount * 1_000_000_000) 
            }
        };

        var content = new StringContent(JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json");

        var response = await client.PostAsync(endpoint, content);
        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        return responseString;
    }
}