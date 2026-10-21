import { pb, Account } from '../lib/pocketbase';

export class AccountService {
  /**
   * Créer un nouveau compte bancaire pour un utilisateur
   */
  static async createAccount(userId: string, accountType: 'Checking' | 'Savings' | 'Investment' = 'Checking'): Promise<Account> {
    try {
      // Générer un numéro de compte unique (IBAN français fictif)
      const accountNumber = this.generateAccountNumber();
      
      const accountData = {
        userId,
        accountNumber,
        balance: '0.00', // Solde initial à zéro
        currency: 'EUR',
        accountType
      };

      const account = await pb.collection('Accounts').create(accountData);
      return account as Account;
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      throw new Error('Erreur lors de la création du compte bancaire');
    }
  }

  /**
   * Obtenir tous les comptes d'un utilisateur
   */
  static async getUserAccounts(userId: string): Promise<Account[]> {
    try {
      const result = await pb.collection('Accounts').getList(1, 500, {
        filter: `userId = "${userId}"`,
        sort: '-created'
      });
      return result.items as Account[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des comptes:', error);
      throw new Error('Erreur lors de la récupération des comptes');
    }
  }

  /**
   * Obtenir un compte spécifique
   */
  static async getAccount(accountId: string): Promise<Account> {
    try {
      const account = await pb.collection('Accounts').getOne(accountId);
      return account as Account;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du compte:', error);
      throw new Error('Compte non trouvé');
    }
  }

  /**
   * Mettre à jour le solde d'un compte
   */
  static async updateBalance(accountId: string, newBalance: string): Promise<Account> {
    try {
      const updatedAccount = await pb.collection('Accounts').update(accountId, {
        balance: newBalance
      });
      return updatedAccount as Account;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      throw new Error('Erreur lors de la mise à jour du solde');
    }
  }

  /**
   * Générer un numéro de compte IBAN français fictif
   */
  private static generateAccountNumber(): string {
    // Format IBAN français: FR76 XXXX XXXX XXXX XXXX XXXX XXX
    const bankCode = '30003'; // Code banque ${BANK_CONFIG.name} fictif
    const branchCode = '03000'; // Code guichet fictif
    const accountNumber = Math.random().toString().slice(2, 13).padEnd(11, '0'); // 11 chiffres
    const checkDigits = Math.floor(Math.random() * 99).toString().padStart(2, '0'); // Clé de contrôle aléatoire
    
    return `FR${checkDigits}${bankCode}${branchCode}${accountNumber}`;
  }
}