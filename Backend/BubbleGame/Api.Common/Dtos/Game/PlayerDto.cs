namespace Api.Common.Game;

public record PlayerDto(
    Guid GameId,
    Guid PlayerId, 
    float PositionX, 
    float PositionY, 
    double BallSize
    );