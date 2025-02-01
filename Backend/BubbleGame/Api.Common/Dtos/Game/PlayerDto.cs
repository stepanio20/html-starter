namespace Api.Common.Game;

public record DustDto(
    string Id, 
    float PositionX,
    float PositionY
    );

public record BinocularDto(Guid Id, float PositionX, float PositionY);
public record MagnetDto(Guid Id, float PositionX, float PositionY);

public record PlayerDto(
    Guid GameId,
    string PlayerId, 
    float PositionX, 
    float PositionY, 
    decimal Deposit,
    string Color,
    float Size,
    int Dusts
    );
public record FirstConnectionDto(
    Guid GameId,
    string PlayerId, 
    float PositionX, 
    float PositionY, 
    float BallSize,
    string Color,
    DateTime EndAt,
    decimal Deposit,
    int Dusts
);