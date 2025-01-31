using BubbleGame.Core.DustParticles;

namespace BubbleGame.Application.Services.Dusts;

public interface IDustService
{
    Task<List<DustParticle>> GenerateAsync(int count = 1000);
    Task<DustParticle> GetAsync(string dustId);
    Task RemoveAsync(DustParticle dustParticle);
    Task<DustParticle> UpdateAsync(DustParticle dustParticle);
    Task<List<DustParticle>> GetByGameAsync(string gameId);
}