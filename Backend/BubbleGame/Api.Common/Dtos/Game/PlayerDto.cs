namespace Api.Common.Game;

public record PlayerDto(
    Guid GameId,
    string PlayerId, 
    float PositionX, 
    float PositionY, 
    double BallSize
    );