using System.Text.Json.Serialization;

namespace Api.Common.Game;

public class DustDto
{
    public string Id { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
}

public class BinocularDto
{
    public Guid Id { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
}

public class MagnetDto
{
    public Guid Id { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
}

public class PlayerDto
{
    public Guid GameId { get; set; }
    public string PlayerId { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public decimal Deposit { get; set; }
    public string Color { get; set; }
    public float Size { get; set; }
    public int Dusts { get; set; }
}

public class FirstConnectionDto
{
    public Guid GameId { get; set; }
    public string PlayerId { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float BallSize { get; set; }
    public string Color { get; set; }
    public DateTime EndAt { get; set; }
    public decimal Deposit { get; set; }
    public int Dusts { get; set; }
}
