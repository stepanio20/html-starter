namespace BubbleGame.Cache;

public interface ICacheService
{ 
    Task<List<T>> GetAsync<T>(string key);
    Task<T> GetByKeyAsync<T>(string key);
    Task SaveAsync<T>(string key, T value);
    Task DeleteAsync(string key);
}