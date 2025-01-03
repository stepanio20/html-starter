using Api.Common.Static.Sockets;
using Api.Hubs;
using Api.Routes;
using BubbleGame.Application.Services.Ton;
using BubbleGame.Cache;
using BubbleGame.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllPolicy", policy =>
    {
        policy.AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(origin => true) // Allow all origins
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();
builder.Services.AddCache(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Logging.AddConsole();

var app = builder.Build();

app.UseCors("AllowAllPolicy"); 

app.UseWebSockets();
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger(); 
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bubble Game API v1");
        c.RoutePrefix = "docs";
    });
}

app.AddGameRoute();
app.AddPaymentRoute();

app.MapHub<GameHub>($"/{SocketDefault.HUB}");
app.Run();