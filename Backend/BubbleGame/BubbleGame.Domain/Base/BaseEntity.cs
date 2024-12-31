using System.Text.Json.Serialization;

namespace BubbleGame.Core.Base;

public class BaseEntity
{
    private Guid _id;
    
    [JsonPropertyName("Id")]
    public Guid Id { get; set; }//todo make private
}