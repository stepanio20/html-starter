using BubbleGame.Application.Services.Dusts;
using BubbleGame.Cache;
using BubbleGame.Core.DustParticles;
using BubbleGame.Core.Games;

namespace BubbleGame.Persistence.Services.Dusts;

public class DustService(ICacheService cacheService) : IDustService
{
    public async Task<List<DustParticle>> GenerateAsync(int count = 1000)
    {
        var random = new Random();
        var dustParticles = new List<DustParticle>();

        for (var i = 0; i < count; i++)
        {
            dustParticles.Add(new DustParticle
            {
                PositionX = random.Next(0, 12000),
                PositionY = random.Next(0, 12000)
            });
        }

        var saveTasks = dustParticles
            .Select(dustParticle => cacheService.SaveAsync(dustParticle.Id.ToString(), dustParticle))
            .ToList();

        await Task.WhenAll(saveTasks);

        return dustParticles;
    }

    public async Task<DustParticle> GetAsync(string dustId)
    {
        var dust = await cacheService.GetByKeyAsync<DustParticle>(dustId);
        return dust;
    }

    public async Task<DustParticle> UpdateAsync(DustParticle dustParticle)
    {
        var random = new Random();
        dustParticle.PositionX = random.Next(0, 12000);
        dustParticle.PositionY = random.Next(0, 12000);
        
        await cacheService.SaveAsync(dustParticle.Id.ToString(), dustParticle);
        return dustParticle;
    }

    public async Task<List<DustParticle>> GetByGameAsync(string gameId)
    {
        var room = await cacheService.GetByKeyAsync<Room>(gameId);
        return room.Dusts;
    }

    public async Task RemoveAsync(DustParticle dustParticle)
    {
        await cacheService.DeleteAsync(dustParticle.Id.ToString());
    }
}