namespace Api.Common.Game;

public record DustDto(
    string Id, 
    float PositionX,
    float PositionY
    );

public record MagnetDto(Guid Id, float PositionX, float PositionY);

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