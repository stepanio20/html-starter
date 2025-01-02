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
    public async Task<string> SendTransactionAsync(string privateKey, string recipientAddress, decimal amount)
    {
        return "asd";
        // TonClient tonclient = new(new TonClientParameters
        // {
        //     Endpoint = "https://toncenter.com/api/v2/jsonRPC",
        //     ApiKey = "...",
        // });
        //
        // var mnemonic = new Mnemonic();
        //
        // WalletV4 walletV4 = new WalletV4(new WalletV4Options() { PublicKey = mnemonic.Keys.PublicKey! });
        //
        // ExternalInMessage message = walletV4.CreateTransferMessage(new[]
        // {
        //     new WalletTransfer
        //     {
        //         Message = new ExternalInMessage(new()
        //         {
        //             Info = new ExtInMsgInfo(new()
        //             {
        //                 Dest = new Address(recipientAddress),
        //                 ImportFee = new Coins("0.013"),
        //                 Src = walletV4.Address
        //             }),
        //             Body = new Message(new Address(recipientAddress), new Coins("0.5")).Payload,
        //             StateInit = new StateInit(new StateInitOptions()),
        //         }),
        //         Mode = 1
        //     }
        // }, 0).Sign(mnemonic.Keys.PrivateKey, true);
        //
        // await tonclient.SendBoc(message.Cell!);
        //
        // var content = new StringContent(JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json");
        //
        // var response = await client.PostAsync(endpoint, content);
        // response.EnsureSuccessStatusCode();
        //
        // var responseString = await response.Content.ReadAsStringAsync();
        // return responseString;
    }
}