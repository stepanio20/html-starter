namespace Api.Routes;

internal static class GameRoute
{
    public static void AddGameRoute(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/games/add", AddGameRoute).AllowAnonymous();
    }
}