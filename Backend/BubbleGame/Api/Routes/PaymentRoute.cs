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
    }

    private static async Task<IResult> TopUpAsync([FromBody] TopUpRequest request, ITonService tonService, UserManager<AppUser> userManager)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => request.UserId.Equals(x.Id));
        if (user == null || string.IsNullOrEmpty(user.Address))
            return Results.Unauthorized();
        
        user.Balance += request.Amount;
        await userManager.UpdateAsync(user);
        
        return Results.NoContent();
    }
    
    private static async Task<IResult> WithdrawAsync([FromBody] PaymentRequest request, ITonService tonService, UserManager<AppUser> userManager)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => request.UserId.Equals(x.Id));
        if (user == null || string.IsNullOrEmpty(user.Address))
            return Results.Unauthorized();
        
        user.Balance -= request.Amount;
        await tonService.TransferTonAsync(request.Amount, user.Address);
        return Results.Ok();
    }

    private class PaymentRequest
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
    }

    private class TopUpRequest
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
    }
}
