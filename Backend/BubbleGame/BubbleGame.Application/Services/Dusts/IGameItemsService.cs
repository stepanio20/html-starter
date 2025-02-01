using BubbleGame.Core.DustParticles;
using BubbleGame.Core.GameItems;
using BubbleGame.Core.Games;

namespace BubbleGame.Application.Services.Dusts;

public interface IGameItemsService
{
    Task<Magnet> GetMagnetByIdAsync(string id);
    Task<List<Binocular>> GenerateBinoculars(Guid roomId, int count = 100);
    Task<List<DustParticle>> GetDustByGameIdAsync(string id);
    Task<List<DustParticle>> GenerateAsync(Room room, int count = 1000);
    Task<List<Magnet>> GenerateMagnets(Guid roomId, int count = 100);
    Task<DustParticle> GetAsync(string id);
    Task<Binocular> GetBinocularAsync(string id);
    Task RemoveAsync(DustParticle dustParticle);
    Task RemoveAsync(Binocular dustParticle);
    Task<DustParticle> UpdateAsync(DustParticle dustParticle);
    Task RemoveAsync(Magnet dustParticle);
    Task<List<DustParticle>> GetByGameAsync(string gameId);
}