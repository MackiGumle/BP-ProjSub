using System;

namespace BP_ProjSub.Server.Data.Dtos;

public class RatingDto
{
    public int Id { get; set; }

    public DateTime Time { get; set; }

    public decimal Value { get; set; }

    public string? Note { get; set; }
}
