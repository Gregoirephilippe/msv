import { pb } from '../lib/pocketbase';

export interface AdminUser {
  id: string;
  email: string;
  emailVisibility?: boolean;
  verified?: boolean;
  created?: string;
  updated?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
}

export interface AccountStats {
  totalAccounts: number;
  checkingAccounts: number;
  savingsAccounts: number;
  investmentAccounts: number;
  totalBalance: number;
  averageBalance: number;
}

export interface TransactionStats {
  totalTransactions: number;
  transactionsToday: number;
  transactionsThisMonth: number;
  totalVolume: number;
  volumeToday: number;
  volumeThisMonth: number;
  pendingTransactions: number;
}

export class AdminService {
  /**
   * Connexion administrateur avec superuser
   */
  static async adminLogin(email: string, password: string): Promise<AdminUser> {
    try {
      const authData = await pb.collection('_superusers').authWithPassword(email, password);
      return authData.record as AdminUser;
    } catch (error: any) {
      console.error('Erreur lors de la connexion admin:', error);
      throw new Error('Email ou mot de passe administrateur incorrect');
    }
  }

  /**
   * Vérifier si l'utilisateur connecté est un admin
   */
  static isAdmin(): boolean {
    return pb.authStore.isValid && pb.authStore.record?.collectionName === '_superusers';
  }

  /**
   * Obtenir l'admin connecté
   */
  static getCurrentAdmin(): AdminUser | null {
    if (this.isAdmin()) {
      return pb.authStore.record as AdminUser;
    }
    return null;
  }

  /**
   * Déconnexion admin
   */
  static adminLogout(): void {
    pb.authStore.clear();
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      // Total des utilisateurs
      const totalResult = await pb.collection('users').getList(1, 1, { skipTotal: false });
      const totalUsers = totalResult.totalItems;

      // Utilisateurs actifs (vérifiés)
      const activeResult = await pb.collection('users').getList(1, 1, {
        filter: 'verified = true && accountStatus = "Active"',
        skipTotal: false
      });
      const activeUsers = activeResult.totalItems;

      // Utilisateurs en attente
      const pendingResult = await pb.collection('users').getList(1, 1, {
        filter: 'accountStatus = "Pending"',
        skipTotal: false
      });
      const pendingUsers = pendingResult.totalItems;

      // Utilisateurs suspendus
      const suspendedResult = await pb.collection('users').getList(1, 1, {
        filter: 'accountStatus = "Suspended"',
        skipTotal: false
      });
      const suspendedUsers = suspendedResult.totalItems;

      // Nouveaux utilisateurs aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const todayResult = await pb.collection('users').getList(1, 1, {
        filter: `created >= "${today} 00:00:00"`,
        skipTotal: false
      });
      const newUsersToday = todayResult.totalItems;

      // Nouveaux utilisateurs ce mois
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const monthResult = await pb.collection('users').getList(1, 1, {
        filter: `created >= "${firstDayOfMonth} 00:00:00"`,
        skipTotal: false
      });
      const newUsersThisMonth = monthResult.totalItems;

      return {
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        newUsersToday,
        newUsersThisMonth
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des stats utilisateurs:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Obtenir les statistiques des comptes
   */
  static async getAccountStats(): Promise<AccountStats> {
    try {
      // Vérifier d'abord si la collection existe et récupérer quelques comptes pour tester
      let totalAccounts = 0;
      let checkingAccounts = 0;
      let savingsAccounts = 0;
      let investmentAccounts = 0;
      let totalBalance = 0;
      let averageBalance = 0;

      try {
        // Total des comptes
        const totalResult = await pb.collection('Accounts').getList(1, 1, { skipTotal: false });
        totalAccounts = totalResult.totalItems;

        if (totalAccounts > 0) {
          // Récupérer tous les comptes pour analyser les types disponibles
          const allAccountsResult = await pb.collection('Accounts').getList(1, 500);
          
          // Analyser les types de comptes disponibles
          const accountTypes = new Set(allAccountsResult.items.map(account => account.accountType));
          console.log('Types de comptes disponibles:', Array.from(accountTypes));

          // Compter par type (en utilisant les valeurs réelles de la base)
          checkingAccounts = allAccountsResult.items.filter(account => 
            account.accountType === 'Checking' || account.accountType === 'checking' || account.accountType === 'Courant'
          ).length;

          savingsAccounts = allAccountsResult.items.filter(account => 
            account.accountType === 'Savings' || account.accountType === 'savings' || account.accountType === 'Épargne'
          ).length;

          investmentAccounts = allAccountsResult.items.filter(account => 
            account.accountType === 'Investment' || account.accountType === 'investment' || account.accountType === 'Investissement'
          ).length;

          // Calculer les soldes
          totalBalance = allAccountsResult.items.reduce((sum, account) => {
            const balance = parseFloat(account.balance || '0');
            return sum + (isNaN(balance) ? 0 : balance);
          }, 0);
          
          averageBalance = totalAccounts > 0 ? totalBalance / totalAccounts : 0;
        }
      } catch (collectionError: any) {
        console.warn('Erreur lors de l\'accès à la collection Accounts:', collectionError);
        // Continuer avec des valeurs par défaut
      }

      return {
        totalAccounts,
        checkingAccounts,
        savingsAccounts,
        investmentAccounts,
        totalBalance,
        averageBalance
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des stats comptes:', error);
      // Retourner des valeurs par défaut au lieu de lever une erreur
      return {
        totalAccounts: 0,
        checkingAccounts: 0,
        savingsAccounts: 0,
        investmentAccounts: 0,
        totalBalance: 0,
        averageBalance: 0
      };
    }
  }

  /**
   * Obtenir les statistiques des transactions
   */
  static async getTransactionStats(): Promise<TransactionStats> {
    try {
      let totalTransactions = 0;
      let transactionsToday = 0;
      let transactionsThisMonth = 0;
      let totalVolume = 0;
      let volumeToday = 0;
      let volumeThisMonth = 0;
      let pendingTransactions = 0;

      try {
        // Total des transactions
        const totalResult = await pb.collection('Transactions').getList(1, 1, { skipTotal: false });
        totalTransactions = totalResult.totalItems;

        if (totalTransactions > 0) {
          // Transactions aujourd'hui
          const today = new Date().toISOString().split('T')[0];
          const todayResult = await pb.collection('Transactions').getList(1, 1, {
            filter: `created >= "${today} 00:00:00"`,
            skipTotal: false
          });
          transactionsToday = todayResult.totalItems;

          // Transactions ce mois
          const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
          const monthResult = await pb.collection('Transactions').getList(1, 1, {
            filter: `created >= "${firstDayOfMonth} 00:00:00"`,
            skipTotal: false
          });
          transactionsThisMonth = monthResult.totalItems;

          // Transactions en attente
          const pendingResult = await pb.collection('Transactions').getList(1, 1, {
            filter: 'status = "Pending"',
            skipTotal: false
          });
          pendingTransactions = pendingResult.totalItems;

          // Calculer les volumes (limité pour éviter les erreurs)
          const allTransactionsResult = await pb.collection('Transactions').getList(1, Math.min(1000, totalTransactions));
          totalVolume = allTransactionsResult.items.reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount || '0');
            return sum + (isNaN(amount) ? 0 : Math.abs(amount));
          }, 0);

          const todayTransactionsResult = await pb.collection('Transactions').getList(1, 500, {
            filter: `created >= "${today} 00:00:00"`
          });
          volumeToday = todayTransactionsResult.items.reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount || '0');
            return sum + (isNaN(amount) ? 0 : Math.abs(amount));
          }, 0);

          const monthTransactionsResult = await pb.collection('Transactions').getList(1, 500, {
            filter: `created >= "${firstDayOfMonth} 00:00:00"`
          });
          volumeThisMonth = monthTransactionsResult.items.reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount || '0');
            return sum + (isNaN(amount) ? 0 : Math.abs(amount));
          }, 0);
        }
      } catch (collectionError: any) {
        console.warn('Erreur lors de l\'accès à la collection Transactions:', collectionError);
        // Continuer avec des valeurs par défaut
      }

      return {
        totalTransactions,
        transactionsToday,
        transactionsThisMonth,
        totalVolume,
        volumeToday,
        volumeThisMonth,
        pendingTransactions
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des stats transactions:', error);
      // Retourner des valeurs par défaut au lieu de lever une erreur
      return {
        totalTransactions: 0,
        transactionsToday: 0,
        transactionsThisMonth: 0,
        totalVolume: 0,
        volumeToday: 0,
        volumeThisMonth: 0,
        pendingTransactions: 0
      };
    }
  }

  /**
   * Obtenir la liste des utilisateurs avec pagination
   */
  static async getUsers(page: number = 1, perPage: number = 50, filter?: string) {
    try {
      const options: any = {
        sort: '-created'
      };

      if (filter) {
        options.filter = filter;
      }

      const result = await pb.collection('users').getList(page, perPage, options);
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  }

  /**
   * Mettre à jour le statut d'un utilisateur
   */
  static async updateUserStatus(userId: string, status: 'Pending' | 'Active' | 'Suspended' | 'Closed'): Promise<void> {
    try {
      await pb.collection('users').update(userId, {
        accountStatus: status
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async getUserById(userId: string): Promise<any> {
    try {
      const user = await pb.collection('users').getOne(userId);
      return user;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error('Utilisateur non trouvé');
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(userId: string, updates: Partial<any>): Promise<any> {
    try {
      const updatedUser = await pb.collection('users').update(userId, updates);
      return updatedUser;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  /**
   * Vérifier un utilisateur (changer verified à true)
   */
  static async verifyUser(userId: string): Promise<any> {
    try {
      const updatedUser = await pb.collection('users').update(userId, {
        verified: true
      });
      return updatedUser;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      throw new Error('Erreur lors de la vérification de l\'utilisateur');
    }
  }

  /**
   * Annuler la vérification d'un utilisateur (changer verified à false)
   */
  static async unverifyUser(userId: string): Promise<any> {
    try {
      const updatedUser = await pb.collection('users').update(userId, {
        verified: false
      });
      return updatedUser;
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation de vérification:', error);
      throw new Error('Erreur lors de l\'annulation de vérification');
    }
  }

  /**
   * Obtenir les conversations de support
   */
  static async getSupportConversations(limit: number = 100) {
    try {
      const result = await pb.collection('SupportChat').getList(1, limit, {
        sort: '-created'
      });
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw new Error('Erreur lors de la récupération des conversations');
    }
  }
}