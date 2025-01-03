using System.Text.Json;
using BubbleGame.Application.Services.Ton;
using Microsoft.AspNetCore.Mvc;

namespace Api.Routes;

internal static class PaymentRoute
{
    public static void AddPaymentRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/top-up", WithdrawAsync)
            .AllowAnonymous();
    }

    private static async Task<IResult> WithdrawAsync([FromBody] PaymentRequest request, ITonService tonService)
    {
        var address = "UQA9VCPtX32dKzRAtuG8uMuViDMVVjNxNwomiUTkbWvqPc6d";
        await tonService.TransferTonAsync(request.Amount, address);
        return Results.Ok();
    }

    public class PaymentRequest
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
    }
}
