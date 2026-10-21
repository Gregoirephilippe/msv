import { pb, Card, Account } from '../lib/pocketbase';
import { TransactionService } from './transactionService';
import { NotificationService } from './notificationService';

export class CardService {
  /**
   * Commander une nouvelle carte Visa
   */
  static async orderNewCard(userId: string, accountId: string): Promise<Card> {
    try {
      // 1. Vérifier que le compte appartient à l'utilisateur
      const account = await pb.collection('Accounts').getOne(accountId, {
        requestKey: null
      });
      
      if (account.userId !== userId) {
        throw new Error('Compte non autorisé');
      }

      // 2. Vérifier le solde (minimum 100€)
      const currentBalance = parseFloat(account.balance || '0');
      if (currentBalance < 100) {
        throw new Error('Solde insuffisant. Minimum 100€ requis pour commander une carte.');
      }

      // 3. Vérifier le nombre de cartes existantes (max 3 par compte)
      const existingCardsResult = await pb.collection('Cards').getList(1, 10, {
        filter: `accountId = "${accountId}"`
      });

      if (existingCardsResult.items.length >= 3) {
        throw new Error('Limite de 3 cartes par compte atteinte.');
      }

      // 4. Débiter 50€ pour les frais de carte
      const cardFee = 50;
      try {
        await TransactionService.withdraw(accountId, cardFee, 'Frais de commande de carte Visa');
      } catch (transactionError) {
        console.error('Erreur lors du débit des frais:', transactionError);
        throw new Error('Impossible de débiter les frais de carte. Vérifiez votre solde.');
      }

      // 5. Générer les données de la nouvelle carte
      const cardData = {
        accountId,
        cardType: 'Visa',
        cardNumber: this.generateVisaCardNumber(),
        cvv: this.generateCVV(),
        expirationMonth: 12,
        expirationYear: new Date().getFullYear() + 4, // Valide 4 ans
        status: 'Active'
      };

      // 6. Créer la carte dans la base de données
      const newCard = await pb.collection('Cards').create(cardData);

      // 7. Créer une notification de confirmation
      try {
        await NotificationService.createNotification(
          userId,
          'System',
          `Votre nouvelle carte Visa se terminant par ${cardData.cardNumber.slice(-4)} a été commandée avec succès. Elle sera livrée sous 5-7 jours ouvrés.`
        );
      } catch (notificationError) {
        console.warn('Impossible de créer la notification:', notificationError);
      }

      return newCard as Card;
    } catch (error: any) {
      console.error('Erreur lors de la commande de carte:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les cartes d'un utilisateur
   */
  static async getUserCards(userId: string): Promise<Card[]> {
    try {
      // D'abord récupérer les comptes de l'utilisateur
      const accountsResult = await pb.collection('Accounts').getList(1, 100, {
        filter: `userId = "${userId}"`
      });

      if (accountsResult.items.length === 0) {
        return [];
      }

      // Créer un filtre pour toutes les cartes de ces comptes
      const accountFilters = accountsResult.items.map(account => `accountId = "${account.id}"`);
      const accountFilter = `(${accountFilters.join(' || ')})`;

      const cardsResult = await pb.collection('Cards').getList(1, 100, {
        filter: accountFilter,
        sort: '-created'
      });

      return cardsResult.items as Card[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des cartes:', error);
      throw new Error('Erreur lors de la récupération des cartes');
    }
  }

  /**
   * Bloquer/Débloquer une carte
   */
  static async toggleCardStatus(cardId: string, newStatus: 'Active' | 'Blocked'): Promise<Card> {
    try {
      const updatedCard = await pb.collection('Cards').update(cardId, {
        status: newStatus
      });
      return updatedCard as Card;
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      throw new Error('Erreur lors du changement de statut de la carte');
    }
  }

  /**
   * Générer un numéro de carte Visa valide (fictif)
   */
  private static generateVisaCardNumber(): string {
    // Numéro Visa commence par 4
    const prefix = '4000';
    
    // Générer 12 chiffres aléatoires
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
      cardNumber += Math.floor(Math.random() * 10).toString();
    }
    
    return cardNumber;
  }

  /**
   * Générer un code CVV aléatoire
   */
  private static generateCVV(): string {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  /**
   * Vérifier si l'utilisateur peut commander une carte
   */
  static async canOrderCard(userId: string, accountId: string): Promise<{
    canOrder: boolean;
    reason?: string;
    currentBalance?: number;
  }> {
    try {
      // Vérifier que le compte appartient à l'utilisateur
      const account = await pb.collection('Accounts').getOne(accountId);
      if (account.userId !== userId) {
        return { canOrder: false, reason: 'Compte non autorisé' };
      }

      const currentBalance = parseFloat(account.balance || '0');

      // Vérifier le solde minimum
      if (currentBalance < 100) {
        return { 
          canOrder: false, 
          reason: 'Solde insuffisant (minimum 100€)', 
          currentBalance 
        };
      }

      // Vérifier le nombre de cartes existantes
      const existingCardsResult = await pb.collection('Cards').getList(1, 10, {
        filter: `accountId = "${accountId}"`
      });

      if (existingCardsResult.items.length >= 3) {
        return { 
          canOrder: false, 
          reason: 'Limite de 3 cartes par compte atteinte' 
        };
      }

      return { canOrder: true, currentBalance };
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      return { canOrder: false, reason: 'Erreur lors de la vérification' };
    }
  }
}