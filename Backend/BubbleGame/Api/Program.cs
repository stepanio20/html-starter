using Api.Common.Static.Sockets;
using Api.Hubs;
using Api.Routes;
using BubbleGame.Cache;

var builder = WebApplication.CreateBuilder(args);

// Add CORS services
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

// Add other services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();
builder.Services.AddCache(builder.Configuration);

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Logging.AddConsole();

var app = builder.Build();

// Use CORS middleware
app.UseCors("AllowAllPolicy");  // Use the policy by name

app.UseWebSockets();
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger(); 
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bubble Game API v1");
    });
}

app.AddGameRoute();
app.MapHub<GameHub>($"/{SocketDefault.HUB}");

app.Run();