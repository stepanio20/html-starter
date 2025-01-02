using System.Text;
using BubbleGame.Application.Services.Ton;
using Newtonsoft.Json;
using TonSdk.Client;
using TonSdk.Connect;
using TonSdk.Contracts.Wallet;
using TonSdk.Core;
using TonSdk.Core.Block;
using TonSdk.Core.Crypto;

namespace BubbleGame.Persistence.Services.Ton;

internal sealed class TonService(string endpoint) : ITonService
{
    private static readonly HttpClient client = new HttpClient();
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