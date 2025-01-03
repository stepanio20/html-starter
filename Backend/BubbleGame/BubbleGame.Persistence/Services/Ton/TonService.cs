using System.Text;
using System.Text.Json;
using BubbleGame.Application.Services.Ton;


namespace BubbleGame.Persistence.Services.Ton;

internal sealed class TonService(string endpoint) : ITonService
{
    private static readonly HttpClient client = new HttpClient();
    public async Task TransferTonAsync(decimal amount, string recipientAddress)
    {
        var endpoint = "http://127.0.0.1:8000/withdraw?X_TOKEN=9c79ec24-652b-45ab-9567-bd9c63d6694a";
        var transferData = new
        {
            amount = amount, // Убедитесь, что это число (float или decimal)
            address = recipientAddress // Убедитесь, что это строка
        };


        var jsonContent = JsonSerializer.Serialize(transferData);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        
        try
        {
            var response = await client.PostAsync(endpoint, content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response: {responseContent}");
            }
            else
            {
                Console.WriteLine($"Error: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Request failed: {ex.Message}");
        }
    }

    public async Task<string> SendTransactionAsync(string privateKey, string recipientAddress, decimal amount)
    {
        // try
        // {
        //     recipientAddress = "UQA9VCPtX32dKzRAtuG8uMuViDMVVjNxNwomiUTkbWvqPc6d";
        //     var dest = new Address(recipientAddress);
        //     var cl = new TonClient(TonClientType.HTTP_TONCENTERAPIV2, new HttpParameters()
        //     {
        //         Endpoint = "https://toncenter.com/api/v2/jsonRPC",
        //         ApiKey = "62f13d452c65573a4a0c2eb21c4d6c9243594d20daf2f9fbd318faa3ba31d5c5"
        //     });
        //     
        //     var mnemonic = new Mnemonic([
        //         "clinic", "juice", "plug", "coyote", "child", "age", "peanut", 
        //         "popular", "stand", "ozone", "mad", "name", "confirm", 
        //         "sentence", "manual", "rookie", "guitar", "ensure", 
        //         "area", "innocent", "magnet", "pass", "round", "hungry"
        //     ]);
        //     var walletV4 = new WalletV3(new WalletV3Options() { PublicKey = mnemonic.Keys.PublicKey!, Workchain = 0});
        //     var message = walletV4.CreateTransferMessage([
        //         new WalletTransfer
        //         {
        //             Message = new ExternalInMessage(new ExternalInMessageOptions
        //             {
        //                 Info = new ExtInMsgInfo(new ExtInMsgInfoOptions
        //                 {
        //                     Dest = dest,
        //                     ImportFee = new Coins("0.01"),
        //                     Src = walletV4.Address
        //                 }),
        //                 Body = new Message(dest, new Coins("0.1")).Payload
        //             })
        //         }
        //     ], 1).Sign(mnemonic.Keys.PrivateKey, true);
        //
        //     await cl.SendBoc(message.Cell!);
        //
        //     return "";
        // }
        // catch (Exception ex)
        // {
        //     Console.WriteLine($"Transaction failed: {ex.Message}");
        // }
        //
        // return "";

        return "";
    }
}