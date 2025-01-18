using System.Text.Json;
using BubbleGame.Application.Services.Ton;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Routes;

internal static class PaymentRoute
{
    public static void AddPaymentRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/top-up", TopUpAsync);
        app.MapPost("/api/payments/withdraw", WithdrawAsync);
        app.MapGet("/api/payments/get-usdt-price", async (AppDbContext context) =>
        {
            var fiat = await context.Fiats.FirstOrDefaultAsync();
            return fiat == null ? Results.NotFound() : Results.Ok(fiat.UsdtTon);
        });
        app.MapGet("/api/payments/get-address", () => "UQAT3S5Z2A81Vn8XPrOIXAuCQerScxBI2cH8jBXfaEdD2-BD");
    }

    private static async Task<IResult> TopUpAsync([FromBody] TopUpRequest request, ITonService tonService,
        UserManager<AppUser> userManager)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => request.UserId.Equals(x.Id));
        if (user == null || string.IsNullOrEmpty(user.Address))
            return Results.Unauthorized();

        switch (request.FiatType)
        {
            case FiatType.TON:
                user.Balance += request.Amount;
                await userManager.UpdateAsync(user);
                break;
            case FiatType.USDT:
                user.Balance += request.Amount;
                await userManager.UpdateAsync(user);

                await tonService.ConvertTonAsync(request.Amount);
                break;
            case FiatType.XTR:
            default:
            {
                var result = await tonService.GenerateStartPaymentLink(request.Amount);
                return Results.Ok(result);
            }
        }


        return Results.NoContent();
    }

    private static async Task<IResult> WithdrawAsync([FromBody] PaymentRequest request, ITonService tonService,
        UserManager<AppUser> userManager)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => request.UserId.Equals(x.Id));
        if (user == null || string.IsNullOrEmpty(user.Address))
            return Results.Unauthorized();

        user.Balance -= request.Amount;
        await userManager.UpdateAsync(user);
        await tonService.TransferTonAsync(request.Amount, user.Address);
        return Results.Ok();
    }

    private class PaymentRequest
    {
        public string UserId { get; set; }
        public decimal Amount { get; set; }
    }

    private class TopUpRequest
    {
        public string UserId { get; set; }
        public decimal Amount { get; set; }
        public FiatType FiatType { get; set; }
    }

    private enum FiatType
    {
        USDT,
        TON,
        XTR
    }
}