using BubbleGame.Application.Services.Dusts;
using BubbleGame.Cache;
using BubbleGame.Core.Base;
using BubbleGame.Core.DustParticles;
using BubbleGame.Core.GameItems;
using BubbleGame.Core.Games;

namespace BubbleGame.Persistence.Services.Dusts;

public class GameItemsService(ICacheService cacheService) : IGameItemsService
{
    public async Task<List<Binocular>> GenerateBinoculars(int count = 20)
    {
        var random = new Random();
        var binoculars = new List<Binocular>();

        for (var i = 0; i < count; i++)
        {
            binoculars.Add(new Binocular()
            {
                Id = Guid.NewGuid(),
                PositionX = random.Next(0, 12000),
                PositionY = random.Next(0, 12000)
            });
        }

        var saveTasks = binoculars
            .Select(binocular => cacheService.SaveAsync(binocular.Id.ToString(), binocular))
            .ToList();

        await Task.WhenAll(saveTasks);

        return binoculars;
    }
    public async Task<List<Magnet>> GenerateMagnets(int count = 20)
    {
        var random = new Random();
        var magnets = new List<Magnet>();

        for (var i = 0; i < count; i++)
        {
            magnets.Add(new Magnet()
            {
                Id = Guid.NewGuid(),
                PositionX = random.Next(0, 12000),
                PositionY = random.Next(0, 12000)
            });
        }

        var saveTasks = magnets
            .Select(dustParticle => cacheService.SaveAsync(dustParticle.Id.ToString(), dustParticle))
            .ToList();

        await Task.WhenAll(saveTasks);

        return magnets;
    }

    public async Task<Binocular> GetBinocularAsync(string id)
    {
        var binocular = await cacheService.GetByKeyAsync<Binocular>(id);
        return binocular;
    }

    public async Task<Magnet> GetMagnetByIdAsync(string id)
        => await cacheService.GetByKeyAsync<Magnet>(id);

    public async Task<List<DustParticle>> GetDustByGameIdAsync(string id)
    {
        var room = await cacheService.GetByKeyAsync<Room>(id);
        return room == null ? default : room.Dusts;
    }

    public async Task<List<DustParticle>> GenerateAsync(int count = 1000)
    {
        var random = new Random();
        var dustParticles = new List<DustParticle>();

        for (var i = 0; i < count; i++)
        {
            dustParticles.Add(new DustParticle
            {
                Id = Guid.NewGuid(),
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

    public Task RemoveAsync(Binocular dustParticle)
    {
        throw new NotImplementedException();
    }

    public async Task<DustParticle> UpdateAsync(DustParticle dustParticle)
    {
        var random = new Random();
        dustParticle.PositionX = random.Next(0, 12000);
        dustParticle.PositionY = random.Next(0, 12000);
        
        await cacheService.SaveAsync(dustParticle.Id.ToString(), dustParticle);
        return dustParticle;
    }

    public async Task RemoveAsync(Magnet dustParticle)
        => await cacheService.DeleteAsync(dustParticle.Id.ToString());

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