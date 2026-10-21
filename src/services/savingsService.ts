import { pb } from '../lib/pocketbase';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'emergency' | 'purchase' | 'education' | 'retirement' | 'other';
  isActive: boolean;
  settings?: any;
  created?: string;
  updated?: string;
}

export class SavingsService {
  /**
   * Créer un nouvel objectif d'épargne
   */
  static async createSavingsGoal(
    userId: string,
    name: string,
    targetAmount: number,
    targetDate: string,
    category: SavingsGoal['category'] = 'other',
    description?: string,
    settings?: any
  ): Promise<SavingsGoal> {
    try {
      const goalData = {
        userId,
        name: name.trim(),
        description: description?.trim(),
        targetAmount,
        currentAmount: 0, // Commence à zéro
        targetDate: new Date(targetDate).toISOString(),
        category,
        isActive: true,
        settings: settings || {}
      };

      const goal = await pb.collection('SavingsGoals').create(goalData);
      return goal as SavingsGoal;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'objectif:', error);
      throw new Error('Erreur lors de la création de l\'objectif d\'épargne');
    }
  }

  /**
   * Obtenir tous les objectifs d'épargne d'un utilisateur
   */
  static async getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const result = await pb.collection('SavingsGoals').getList(1, 500, {
        filter: `userId = "${userId}"`,
        sort: '-created'
      });
      return result.items as SavingsGoal[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des objectifs:', error);
      throw new Error('Erreur lors de la récupération des objectifs');
    }
  }

  /**
   * Mettre à jour le montant actuel d'un objectif
   */
  static async updateGoalAmount(goalId: string, newAmount: number): Promise<SavingsGoal> {
    try {
      const updatedGoal = await pb.collection('SavingsGoals').update(goalId, {
        currentAmount: newAmount
      });
      return updatedGoal as SavingsGoal;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du montant:', error);
      throw new Error('Erreur lors de la mise à jour du montant');
    }
  }

  /**
   * Alimenter un objectif d'épargne
   */
  static async contributeToGoal(goalId: string, amount: number): Promise<SavingsGoal> {
    try {
      // Récupérer l'objectif actuel
      const goal = await pb.collection('SavingsGoals').getOne(goalId);
      const newAmount = (goal.currentAmount || 0) + amount;

      // Mettre à jour le montant
      const updatedGoal = await pb.collection('SavingsGoals').update(goalId, {
        currentAmount: newAmount
      });

      return updatedGoal as SavingsGoal;
    } catch (error: any) {
      console.error('Erreur lors de l\'alimentation de l\'objectif:', error);
      throw new Error('Erreur lors de l\'alimentation de l\'objectif');
    }
  }

  /**
   * Supprimer un objectif d'épargne
   */
  static async deleteSavingsGoal(goalId: string): Promise<void> {
    try {
      await pb.collection('SavingsGoals').delete(goalId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'objectif:', error);
      throw new Error('Erreur lors de la suppression de l\'objectif');
    }
  }

  /**
   * Activer/Désactiver un objectif
   */
  static async toggleGoalStatus(goalId: string, isActive: boolean): Promise<SavingsGoal> {
    try {
      const updatedGoal = await pb.collection('SavingsGoals').update(goalId, {
        isActive
      });
      return updatedGoal as SavingsGoal;
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      throw new Error('Erreur lors du changement de statut');
    }
  }
}