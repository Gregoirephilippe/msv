/**
 * Service de simulation des fluctuations de marché
 * Génère des variations de prix réalistes pour les investissements
 */
export class MarketSimulationService {
  /**
   * Simule les fluctuations de prix selon le type d'actif
   */
  static simulatePriceFluctuation(
    basePrice: number, 
    assetType: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity' | 'forex'
  ): number {
    // Obtenir la graine basée sur la date du jour pour des fluctuations cohérentes
    const today = new Date().toDateString();
    const seed = this.hashCode(today + assetType + basePrice.toString());
    
    // Générateur pseudo-aléatoire basé sur la graine
    const random = this.seededRandom(seed);
    
    // Paramètres de volatilité selon le type d'actif
    const volatilityParams = this.getVolatilityParams(assetType);
    
    // Générer une variation normale (distribution gaussienne approximée)
    const variation = this.generateNormalDistribution(random, volatilityParams);
    
    // Appliquer la variation au prix de base
    const newPrice = basePrice * (1 + variation);
    
    // S'assurer que le prix reste positif
    return Math.max(newPrice, basePrice * 0.01);
  }

  /**
   * Obtient les paramètres de volatilité selon le type d'actif
   */
  private static getVolatilityParams(assetType: string) {
    switch (assetType) {
      case 'stock':
        return { 
          dailyVolatility: 0.02,    // 2% de volatilité quotidienne
          trend: 0.0002,            // Légère tendance haussière
          maxChange: 0.15           // Maximum 15% de variation
        };
      case 'etf':
        return { 
          dailyVolatility: 0.015,   // 1.5% de volatilité
          trend: 0.0001,            // Tendance plus stable
          maxChange: 0.10           // Maximum 10% de variation
        };
      case 'crypto':
        return { 
          dailyVolatility: 0.05,    // 5% de volatilité (très volatile)
          trend: 0.0005,            // Tendance haussière plus marquée
          maxChange: 0.30           // Maximum 30% de variation
        };
      case 'bond':
        return { 
          dailyVolatility: 0.005,   // 0.5% de volatilité (très stable)
          trend: 0.00005,           // Très faible tendance
          maxChange: 0.03           // Maximum 3% de variation
        };
      case 'commodity':
        return { 
          dailyVolatility: 0.025,   // 2.5% de volatilité
          trend: 0.0001,            // Tendance neutre
          maxChange: 0.20           // Maximum 20% de variation
        };
      case 'forex':
        return { 
          dailyVolatility: 0.008,   // 0.8% de volatilité
          trend: 0.00002,           // Très faible tendance
          maxChange: 0.05           // Maximum 5% de variation
        };
      default:
        return { 
          dailyVolatility: 0.02, 
          trend: 0.0001, 
          maxChange: 0.15 
        };
    }
  }

  /**
   * Génère une distribution normale approximée
   */
  private static generateNormalDistribution(
    random: () => number, 
    params: { dailyVolatility: number; trend: number; maxChange: number }
  ): number {
    // Méthode Box-Muller simplifiée pour distribution normale
    const u1 = random();
    const u2 = random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Appliquer la volatilité et la tendance
    let variation = (z0 * params.dailyVolatility) + params.trend;
    
    // Limiter la variation maximale
    variation = Math.max(-params.maxChange, Math.min(params.maxChange, variation));
    
    return variation;
  }

  /**
   * Génère un hash code à partir d'une chaîne
   */
  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Générateur pseudo-aléatoire basé sur une graine
   */
  private static seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Simule les données de marché pour les indices principaux
   */
  static simulateMarketData(): Array<{
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }> {
    const baseMarkets = [
      { name: 'CAC 40', baseValue: 7234.56, type: 'stock' as const },
      { name: 'S&P 500', baseValue: 4756.23, type: 'stock' as const },
      { name: 'Bitcoin', baseValue: 42150.00, type: 'crypto' as const },
      { name: 'EUR/USD', baseValue: 1.0875, type: 'forex' as const }
    ];

    return baseMarkets.map(market => {
      const currentValue = this.simulatePriceFluctuation(market.baseValue, market.type);
      const change = currentValue - market.baseValue;
      const changePercent = (change / market.baseValue) * 100;

      return {
        name: market.name,
        value: currentValue,
        change,
        changePercent
      };
    });
  }

  /**
   * Simule l'évolution d'un portefeuille sur plusieurs jours
   */
  static simulatePortfolioHistory(
    investments: Array<{ symbol: string; type: string; averagePrice: number; quantity: number }>,
    days: number = 30
  ): Array<{ date: string; totalValue: number; gainLoss: number }> {
    const history: Array<{ date: string; totalValue: number; gainLoss: number }> = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let totalValue = 0;
      let totalInvested = 0;
      
      investments.forEach(investment => {
        // Utiliser la date comme graine pour des prix cohérents
        const dateString = date.toDateString();
        const seed = this.hashCode(dateString + investment.symbol);
        const random = this.seededRandom(seed);
        
        const params = this.getVolatilityParams(investment.type as any);
        const variation = this.generateNormalDistribution(random, params);
        const currentPrice = investment.averagePrice * (1 + variation * i * 0.1); // Accumulation sur le temps
        
        totalValue += investment.quantity * currentPrice;
        totalInvested += investment.quantity * investment.averagePrice;
      });
      
      history.push({
        date: date.toISOString().split('T')[0],
        totalValue,
        gainLoss: totalValue - totalInvested
      });
    }
    
    return history;
  }
}