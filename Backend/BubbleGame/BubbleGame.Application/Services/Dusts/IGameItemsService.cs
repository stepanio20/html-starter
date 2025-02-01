using BubbleGame.Core.DustParticles;
using BubbleGame.Core.GameItems;

namespace BubbleGame.Application.Services.Dusts;

public interface IGameItemsService
{
    Task<Magnet> GetMagnetByIdAsync(string id);
    Task<List<DustParticle>> GetDustByGameIdAsync(string id);
    Task<List<DustParticle>> GenerateAsync(int count = 1000);
    Task<List<Magnet>> GetAllMagnetsAsync(int count = 5);
    Task<DustParticle> GetAsync(string dustId);
    Task RemoveAsync(DustParticle dustParticle);
    Task<DustParticle> UpdateAsync(DustParticle dustParticle);
    Task RemoveAsync(Magnet dustParticle);
    Task<List<DustParticle>> GetByGameAsync(string gameId);
}