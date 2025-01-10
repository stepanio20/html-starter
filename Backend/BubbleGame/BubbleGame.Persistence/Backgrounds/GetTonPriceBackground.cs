using System;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using BubbleGame.Persistence.DAL;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace BubbleGame.Persistence.Backgrounds;

public class GetTonPriceBackground : BackgroundService
{
    private readonly ILogger<GetTonPriceBackground> _logger;
    private readonly HttpClient _httpClient;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    private const string ApiUrl =
        "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,tether&vs_currencies=usd";

    public GetTonPriceBackground(
        IServiceScopeFactory serviceScopeFactory,
        HttpClient httpClient,
        ILogger<GetTonPriceBackground> logger)
    {
        _serviceScopeFactory = serviceScopeFactory ?? throw new ArgumentNullException(nameof(serviceScopeFactory));
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Starting GetTonPriceBackground...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var response = await _httpClient.GetAsync(ApiUrl, stoppingToken);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(stoppingToken);
                    var prices = JsonSerializer.Deserialize<CryptoPrices>(content);

                    if (prices?.TON?.Usd > 0 && prices.Tether?.Usd > 0)
                    {
                        using var scope = _serviceScopeFactory.CreateScope();
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        var fiat = await context.Fiats.FirstOrDefaultAsync(cancellationToken: stoppingToken);
                        if (fiat != null)
                        {
                            fiat.UsdtTon = prices.TON.Usd;
                            await context.SaveChangesAsync(stoppingToken);
                            _logger.LogInformation("Updated TON to USDT price in database.");
                        }
                        else
                        {
                            _logger.LogWarning("Fiat entry not found in the database.");
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Failed to parse prices from the API response.");
                    }
                }
                else
                {
                    _logger.LogError($"Failed to fetch prices: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetTonPriceBackground: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}

public class CryptoPrices
{
    [JsonPropertyName("the-open-network")] public CryptoData? TON { get; set; }

    [JsonPropertyName("tether")] public CryptoData? Tether { get; set; }
}

public class CryptoData
{
    [JsonPropertyName("usd")] public decimal Usd { get; set; }
}
