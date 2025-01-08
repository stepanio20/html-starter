namespace Api.Common.Game;

public record PlayerDto(
    Guid GameId,
    string PlayerId, 
    float PositionX, 
    float PositionY, 
    decimal BallSize,
    string Color
    );
public record FirstConnectionDto(
    Guid GameId,
    string PlayerId, 
    float PositionX, 
    float PositionY, 
    decimal BallSize,
    string Color,
    DateTime EndAt
);