import { pb } from '../lib/pocketbase';

export interface Investment {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  marketData?: any;
  created?: string;
  updated?: string;
}

export interface Portfolio {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  investments: Investment[];
}

export class InvestmentService {
  /**
   * Créer une nouvelle position d'investissement
   */
  static async createInvestment(
    userId: string,
    accountId: string,
    symbol: string,
    name: string,
    type: Investment['type'],
    quantity: number,
    averagePrice: number,
    currency: string = 'EUR',
    marketData?: any
  ): Promise<Investment> {
    try {
      const investmentData = {
        userId,
        accountId,
        symbol: symbol.toUpperCase(),
        name: name.trim(),
        type,
        quantity,
        averagePrice,
        currentPrice: averagePrice, // Prix initial = prix d'achat
        currency,
        marketData: marketData || {}
      };

      const investment = await pb.collection('Investments').create(investmentData);
      return investment as Investment;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'investissement:', error);
      throw new Error('Erreur lors de la création de l\'investissement');
    }
  }

  /**
   * Obtenir tous les investissements d'un utilisateur
   */
  static async getUserInvestments(userId: string): Promise<Investment[]> {
    try {
      const result = await pb.collection('Investments').getList(1, 500, {
        filter: `userId = "${userId}"`,
        sort: '-created'
      });
      return result.items as Investment[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des investissements:', error);
      throw new Error('Erreur lors de la récupération des investissements');
    }
  }

  /**
   * Calculer le portefeuille d'un utilisateur
   */
  static async getUserPortfolio(userId: string): Promise<Portfolio> {
    try {
      const investments = await this.getUserInvestments(userId);
      
      if (investments.length === 0) {
        return {
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          investments: []
        };
      }

      let totalValue = 0;
      let totalInvested = 0;

      investments.forEach(investment => {
        const positionValue = investment.quantity * investment.currentPrice;
        const positionCost = investment.quantity * investment.averagePrice;
        
        totalValue += positionValue;
        totalInvested += positionCost;
      });

      const totalGainLoss = totalValue - totalInvested;
      const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

      return {
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        investments
      };
    } catch (error: any) {
      console.error('Erreur lors du calcul du portefeuille:', error);
      throw new Error('Erreur lors du calcul du portefeuille');
    }
  }

  /**
   * Mettre à jour le prix actuel d'un investissement
   */
  static async updateCurrentPrice(investmentId: string, newPrice: number): Promise<Investment> {
    try {
      const updatedInvestment = await pb.collection('Investments').update(investmentId, {
        currentPrice: newPrice
      });
      return updatedInvestment as Investment;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du prix:', error);
      throw new Error('Erreur lors de la mise à jour du prix');
    }
  }

  /**
   * Ajouter à une position existante
   */
  static async addToPosition(investmentId: string, additionalQuantity: number, purchasePrice: number): Promise<Investment> {
    try {
      // Récupérer l'investissement actuel
      const investment = await pb.collection('Investments').getOne(investmentId);
      
      // Calculer le nouveau prix moyen
      const currentValue = investment.quantity * investment.averagePrice;
      const additionalValue = additionalQuantity * purchasePrice;
      const newQuantity = investment.quantity + additionalQuantity;
      const newAveragePrice = (currentValue + additionalValue) / newQuantity;

      // Mettre à jour l'investissement
      const updatedInvestment = await pb.collection('Investments').update(investmentId, {
        quantity: newQuantity,
        averagePrice: newAveragePrice
      });

      return updatedInvestment as Investment;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout à la position:', error);
      throw new Error('Erreur lors de l\'ajout à la position');
    }
  }

  /**
   * Supprimer un investissement
   */
  static async deleteInvestment(investmentId: string): Promise<void> {
    try {
      await pb.collection('Investments').delete(investmentId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'investissement:', error);
      throw new Error('Erreur lors de la suppression de l\'investissement');
    }
  }

  /**
   * Calculer la plus/moins-value d'un investissement
   */
  static calculateGainLoss(investment: Investment): { gainLoss: number; gainLossPercent: number } {
    const currentValue = investment.quantity * investment.currentPrice;
    const investedValue = investment.quantity * investment.averagePrice;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

    return { gainLoss, gainLossPercent };
  }
}