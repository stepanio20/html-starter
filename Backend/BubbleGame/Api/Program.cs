using Api.Backgrounds;
using Api.Common.Static.Sockets;
using Api.Hubs;
using Api.Routes;
using BubbleGame.Application.Services.Ton;
using BubbleGame.Cache;
using BubbleGame.Persistence;
using BubbleGame.Persistence.Backgrounds;
using BubbleGame.Persistence.DAL;
using BubbleGame.Persistence.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllPolicy", policy =>
    {
        policy.AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(_ => true) 
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();
builder.Services.AddCache(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddHostedService<PlayerLastUpdateBackgroundService>();

builder.Services.AddHttpClient<GetTonPriceBackground>();
builder.Services.AddHostedService<GetTonPriceBackground>();

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Logging.AddConsole();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql("Host=199.247.6.31;Port=5444;Username=user;Password=password;Database=mydatabase;Timeout=30")
        .ConfigureWarnings(warnings => warnings.Ignore(CoreEventId.DetachedLazyLoadingWarning));
});

builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
    {
        options.User.RequireUniqueEmail = false; 
        options.User.AllowedUserNameCharacters = string.Empty; 
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
builder.Logging.AddFilter("System", LogLevel.Warning); 
builder.Logging.AddFilter("Microsoft", LogLevel.Warning);

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("AllowAllPolicy"); 

app.UseWebSockets();
app.UseHttpsRedirection();

// if (app.Environment.IsDevelopment())
// {
    app.MapOpenApi();
    app.UseSwagger(); 
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bubble Game API v1");
        c.RoutePrefix = "docs";
    });
// }

app.MapGet("/health-check", IResult () => Results.Ok());
app.AddGameRoute();
app.AddPaymentRoute();
app.AddAuthRoute();

app.MapHub<GameHub>($"/{SocketDefault.HUB}");
app.Run();