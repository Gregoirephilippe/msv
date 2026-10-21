import { pb, Account, Card, Notification } from '../lib/pocketbase';
import { AccountService } from './accountService';
import { NotificationService } from './notificationService';

export class UserInitializationService {
  /**
   * Initialise toutes les données par défaut pour un nouvel utilisateur
   */
  static async initializeUserData(userId: string): Promise<void> {
    try {
      console.log('Initialisation des données pour l\'utilisateur:', userId);
      
      // 1. Vérifier si l'utilisateur a déjà un compte courant, sinon en créer un
      try {
        await this.createDefaultAccount(userId);
      } catch (accountError) {
        console.warn('Erreur lors de la création du compte par défaut:', accountError);
      }
      
      // 2. Créer un compte d'investissement par défaut
      try {
        await this.createDefaultInvestmentAccount(userId);
      } catch (investmentError) {
        console.warn('Erreur lors de la création du compte d\'investissement:', investmentError);
      }
      
      // 3. Créer une carte virtuelle par défaut
      try {
        await this.createDefaultCard(userId);
      } catch (cardError) {
        console.warn('Erreur lors de la création de la carte par défaut:', cardError);
      }
      
      // 4. Créer une notification de bienvenue
      try {
        await this.createWelcomeNotification(userId);
      } catch (notificationError) {
        console.warn('Erreur lors de la création de la notification:', notificationError);
      }
      
      console.log('Initialisation des données terminée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation des données utilisateur:', error);
      // Ne pas faire échouer l'inscription si l'initialisation échoue
      console.warn('Initialisation partielle - l\'utilisateur pourra créer ses données manuellement');
    }
  }

  /**
   * Vérifie si l'utilisateur a déjà des données initialisées
   */
  static async isUserDataInitialized(userId: string): Promise<boolean> {
    try {
      // Vérifier si l'utilisateur a au moins un compte
      const result = await pb.collection('Accounts').getList(1, 1, {
        filter: `userId = "${userId}"`
      });
      
      return result.items.length > 0;
    } catch (error: any) {
      console.error('Erreur lors de la vérification des données utilisateur:', error);
      return false;
    }
  }

  /**
   * Crée un compte courant par défaut
   */
  private static async createDefaultAccount(userId: string): Promise<Account> {
    try {
      // Vérifier si l'utilisateur a déjà un compte
      const existingResult = await pb.collection('Accounts').getList(1, 1, {
        filter: `userId = "${userId}"`
      });

      if (existingResult.items.length > 0) {
        console.log('L\'utilisateur a déjà un compte');
        return existingResult.items[0] as Account;
      }

      // Générer un numéro de compte IBAN français fictif
      const accountNumber = this.generateAccountNumber();
      
      const accountData = {
        userId,
        accountNumber,
        balance: '0.00',
        currency: 'EUR',
        accountType: 'Checking'
      };

      const account = await pb.collection('Accounts').create(accountData);
      console.log('Compte par défaut créé:', account.id);
      return account as Account;
    } catch (error: any) {
      console.error('Erreur lors de la création du compte par défaut:', error);
      throw error;
    }
  }

  /**
   * Crée un compte d'investissement par défaut
   */
  private static async createDefaultInvestmentAccount(userId: string): Promise<Account> {
    try {
      // Vérifier si l'utilisateur a déjà un compte d'investissement
      const existingResult = await pb.collection('Accounts').getList(1, 1, {
        filter: `userId = "${userId}" && accountType = "Investment"`
      });

      if (existingResult.items.length > 0) {
        console.log('L\'utilisateur a déjà un compte d\'investissement');
        return existingResult.items[0] as Account;
      }

      // Générer un numéro de compte IBAN français fictif
      const accountNumber = this.generateAccountNumber();
      
      const accountData = {
        userId,
        accountNumber,
        balance: '0.00',
        currency: 'EUR',
        accountType: 'Investment'
      };

      const account = await pb.collection('Accounts').create(accountData);
      console.log('Compte d\'investissement créé:', account.id);
      return account as Account;
    } catch (error: any) {
      console.error('Erreur lors de la création du compte d\'investissement:', error);
      throw error;
    }
  }

  /**
   * Crée une carte virtuelle par défaut
   */
  private static async createDefaultCard(userId: string): Promise<void> {
    try {
      // Récupérer le compte de l'utilisateur
      const accountsResult = await pb.collection('Accounts').getList(1, 10, {
        filter: `userId = "${userId}"`
      });

      if (accountsResult.items.length === 0) {
        throw new Error('Aucun compte trouvé pour créer la carte');
      }

      // Prendre le premier compte courant, sinon le premier compte disponible
      const account = accountsResult.items.find(acc => acc.accountType === 'Checking') || accountsResult.items[0];

      // Vérifier si l'utilisateur a déjà une carte
      const existingCardsResult = await pb.collection('Cards').getList(1, 1, {
        filter: `accountId = "${account.id}"`
      });

      if (existingCardsResult.items.length > 0) {
        console.log('L\'utilisateur a déjà une carte');
        return;
      }

      // Générer les données de la carte
      const cardData = {
        accountId: account.id,
        cardType: 'Visa',
        cardNumber: this.generateCardNumber(),
        cvv: this.generateCVV(),
        expirationMonth: 12,
        expirationYear: new Date().getFullYear() + 3,
        status: 'Active'
      };

      const card = await pb.collection('Cards').create(cardData);
      console.log('Carte par défaut créée:', card.id);
      
      // Créer une notification pour informer de la création de la carte
      try {
        await pb.collection('Notifications').create({
          userId,
          type: 'System',
          message: `Votre carte virtuelle Visa se terminant par ${cardData.cardNumber.slice(-4)} a été activée avec succès.`,
          isRead: false
        });
      } catch (notificationError) {
        console.warn('Impossible de créer la notification de carte:', notificationError);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la carte par défaut:', error);
      // Ne pas faire échouer l'initialisation si la carte ne peut pas être créée
      console.warn('Carte par défaut non créée, l\'utilisateur pourra en commander une manuellement');
    }
  }

  /**
   * Crée une notification de bienvenue
   */
  private static async createWelcomeNotification(userId: string): Promise<void> {
    try {
      // Vérifier si l'utilisateur a déjà des notifications
      const existingResult = await pb.collection('Notifications').getList(1, 1, {
        filter: `userId = "${userId}"`
      });

      if (existingResult.items.length > 0) {
        console.log('L\'utilisateur a déjà des notifications');
        return;
      }

      const notificationData = {
        userId,
        type: 'System',
        message: 'Bienvenue chez Xbank ! Votre compte a été créé avec succès. Découvrez toutes nos fonctionnalités.',
        isRead: false,
        link: ''
      };

      const notification = await pb.collection('Notifications').create(notificationData);
      console.log('Notification de bienvenue créée:', notification.id);
    } catch (error: any) {
      console.error('Erreur lors de la création de la notification de bienvenue:', error);
      throw error;
    }
  }

  /**
   * Génère un numéro de compte IBAN français fictif
   */
  private static generateAccountNumber(): string {
    const bankCode = '30003'; // Code banque ${BANK_CONFIG.name} fictif
    const branchCode = '03000'; // Code guichet fictif
    const accountNumber = Math.random().toString().slice(2, 13).padEnd(11, '0');
    const checkDigits = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    
    return `FR${checkDigits}${bankCode}${branchCode}${accountNumber}`;
  }

  /**
   * Génère un numéro de carte fictif
   */
  private static generateCardNumber(): string {
    // Numéro Visa fictif (commence par 4)
    const prefix = '4000';
    const middle = Math.random().toString().slice(2, 10).padEnd(8, '0');
    const suffix = Math.random().toString().slice(2, 6).padEnd(4, '0');
    
    return `${prefix}${middle}${suffix}`;
  }

  /**
   * Génère un CVV fictif
   */
  private static generateCVV(): string {
    return Math.floor(Math.random() * 900 + 100).toString();
  }
}