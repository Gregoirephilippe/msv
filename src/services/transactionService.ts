import { pb, Transaction, Account } from '../lib/pocketbase';
import { BeneficiaryService } from './beneficiaryService';
import { NotificationService } from './notificationService';

export class TransactionService {
  /**
   * Créer une nouvelle transaction
   */
  static async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const transaction = await pb.collection('Transactions').create({
        ...transactionData,
        transactionDate: transactionData.transactionDate || new Date().toISOString(),
        status: transactionData.status || 'Pending'
      });
      return transaction as Transaction;
    } catch (error: any) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw new Error('Erreur lors de la création de la transaction');
    }
  }

  /**
   * Obtenir toutes les transactions d'un compte
   */
  static async getAccountTransactions(accountId: string, limit?: number): Promise<Transaction[]> {
    try {
      const options: any = {
        filter: `accountId = "${accountId}"`,
        sort: '-transactionDate'
      };
      
      if (limit) {
        const result = await pb.collection('Transactions').getList(1, limit, options);
        return result.items as Transaction[];
      } else {
        const result = await pb.collection('Transactions').getList(1, 500, options);
        return result.items as Transaction[];
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw new Error('Erreur lors de la récupération des transactions');
    }
  }

  /**
   * Obtenir toutes les transactions d'un utilisateur (tous ses comptes)
   */
  static async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      // D'abord récupérer les comptes de l'utilisateur
      const accountsResult = await pb.collection('Accounts').getList(1, 100, {
        filter: `userId = "${userId}"`
      });

      if (accountsResult.items.length === 0) {
        return [];
      }

      // Créer un filtre pour toutes les transactions de ces comptes
      const accountFilters = accountsResult.items.map(account => `accountId = "${account.id}"`);
      const accountFilter = `(${accountFilters.join(' || ')})`;

      const transactionsResult = await pb.collection('Transactions').getList(1, limit, {
        filter: accountFilter,
        sort: '-transactionDate'
      });

      return transactionsResult.items as Transaction[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des transactions utilisateur:', error);
      throw new Error(`Erreur lors de la récupération des transactions: ${error.message || error}`);
    }
  }

  /**
   * Effectuer un virement entre comptes
   */
  static async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    beneficiaryName?: string,
    beneficiaryIBAN?: string,
    reference?: string
  ): Promise<{ outTransaction: Transaction; inTransaction: Transaction }> {
    try {
      // Vérifier les comptes
      const fromAccount = await pb.collection('Accounts').getOne(fromAccountId);
      const toAccount = await pb.collection('Accounts').getOne(toAccountId);

      const fromBalance = parseFloat(fromAccount.balance || '0');
      if (fromBalance < amount) {
        throw new Error('Solde insuffisant');
      }

      // Créer la transaction sortante
      const outTransaction = await this.createTransaction({
        accountId: fromAccountId,
        type: 'Transfer_Out',
        amount: -amount, // Montant négatif pour une sortie
        currency: fromAccount.currency || 'EUR',
        description: description || `Virement vers ${beneficiaryName || 'compte externe'}`,
        relatedAccountId: toAccountId,
        beneficiaryName,
        beneficiaryIBAN,
        reference,
        status: 'Completed'
      });

      // Créer la transaction entrante
      const inTransaction = await this.createTransaction({
        accountId: toAccountId,
        type: 'Transfer_In',
        amount: amount, // Montant positif pour une entrée
        currency: toAccount.currency || 'EUR',
        description: description || `Virement reçu de ${fromAccount.accountNumber}`,
        relatedAccountId: fromAccountId,
        reference,
        status: 'Completed'
      });

      // Mettre à jour les soldes
      await pb.collection('Accounts').update(fromAccountId, {
        balance: (fromBalance - amount).toFixed(2)
      });

      const toBalance = parseFloat(toAccount.balance || '0');
      await pb.collection('Accounts').update(toAccountId, {
        balance: (toBalance + amount).toFixed(2)
      });

      return { outTransaction, inTransaction };
    } catch (error: any) {
      console.error('Erreur lors du virement:', error);
      throw new Error(error.message || 'Erreur lors du virement');
    }
  }

  /**
   * Effectuer un dépôt
   */
  static async deposit(accountId: string, amount: number, description: string): Promise<Transaction> {
    try {
      const account = await pb.collection('Accounts').getOne(accountId);
      const currentBalance = parseFloat(account.balance || '0');

      // Créer la transaction
      const transaction = await this.createTransaction({
        accountId,
        type: 'Deposit',
        amount,
        currency: account.currency || 'EUR',
        description,
        status: 'Completed'
      });

      // Mettre à jour le solde
      await pb.collection('Accounts').update(accountId, {
        balance: (currentBalance + amount).toFixed(2)
      });

      return transaction;
    } catch (error: any) {
      console.error('Erreur lors du dépôt:', error);
      throw new Error('Erreur lors du dépôt');
    }
  }

  /**
   * Effectuer un retrait (ATM, guichet)
   */
  static async withdraw(accountId: string, amount: number, description: string): Promise<Transaction> {
    try {
      const account = await pb.collection('Accounts').getOne(accountId);
      const currentBalance = parseFloat(account.balance || '0');

      if (currentBalance < amount) {
        throw new Error('Solde insuffisant');
      }

      // Créer la transaction
      const transaction = await this.createTransaction({
        accountId,
        type: 'Withdrawal',
        amount: -amount, // Montant négatif pour un retrait
        currency: account.currency || 'EUR',
        description,
        status: 'Completed'
      });

      // Mettre à jour le solde
      await pb.collection('Accounts').update(accountId, {
        balance: (currentBalance - amount).toFixed(2)
      });

      return transaction;
    } catch (error: any) {
      console.error('Erreur lors du retrait:', error);
      throw new Error('Erreur lors du retrait');
    }
  }

  /**
   * Effectuer un virement externe (sortant uniquement)
   */
  static async externalTransfer(
    userId: string,
    fromAccountId: string,
    amount: number,
    beneficiaryName: string,
    beneficiaryIban: string,
    description: string,
    reference?: string,
    bankName?: string
  ): Promise<Transaction> {
    try {
      const account = await pb.collection('Accounts').getOne(fromAccountId);
      const currentBalance = parseFloat(account.balance || '0');

      if (currentBalance < amount) {
        throw new Error('Solde insuffisant');
      }

      // Créer automatiquement le bénéficiaire s'il n'existe pas
      try {
        await BeneficiaryService.createBeneficiaryFromTransfer(
          userId,
          beneficiaryName,
          beneficiaryIban,
          bankName
        );
      } catch (beneficiaryError) {
        console.warn('Impossible de créer le bénéficiaire:', beneficiaryError);
        // Continuer même si la création du bénéficiaire échoue
      }

      // Créer la transaction de virement sortant
      const transaction = await this.createTransaction({
        accountId: fromAccountId,
        type: 'Transfer_Out',
        amount: -amount, // Montant négatif pour une sortie
        currency: account.currency || 'EUR',
        description: description || `Virement vers ${beneficiaryName}`,
        beneficiaryName,
        beneficiaryIBAN: beneficiaryIban,
        reference,
        status: 'Pending' // Par défaut en attente
      });

      // Mettre à jour le solde
      await pb.collection('Accounts').update(fromAccountId, {
        balance: (currentBalance - amount).toFixed(2)
      });

      // Créer une notification
      try {
        await NotificationService.createNotification(
          userId,
          'Transaction',
          `Virement de ${amount}€ vers ${beneficiaryName} en cours de traitement`
        );
      } catch (notificationError) {
        console.warn('Impossible de créer la notification:', notificationError);
      }

      return transaction;
    } catch (error: any) {
      console.error('Erreur lors du virement externe:', error);
      throw new Error('Erreur lors du virement externe');
    }
  }
}