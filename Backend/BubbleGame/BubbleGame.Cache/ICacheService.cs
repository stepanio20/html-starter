namespace BubbleGame.Cache;

public interface ICacheService
{ Task SavaAsync<T>(string key, string value);
}