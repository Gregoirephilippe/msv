import React from 'react';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Send, 
  PiggyBank,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { AccountService } from '../../services/accountService';
import { TransactionService } from '../../services/transactionService';
import { UserInitializationService } from '../../services/userInitializationService';
import { Account, Transaction } from '../../lib/pocketbase';
import { SavingsService, SavingsGoal } from '../../services/savingsService';

interface DashboardHomeProps {
  user: any;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const [showBalance, setShowBalance] = React.useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Vérifier si l'utilisateur a des données initialisées
        const isInitialized = await UserInitializationService.isUserDataInitialized(user.id);
        
        if (!isInitialized) {
          console.log('Initialisation des données utilisateur...');
          await UserInitializationService.initializeUserData(user.id);
        }
        
        // Charger les comptes de l'utilisateur
        const userAccounts = await AccountService.getUserAccounts(user.id);
        setAccounts(userAccounts);
        
        // Charger les transactions récentes (5 dernières)
        const userTransactions = await TransactionService.getUserTransactions(user.id, 5);
        setTransactions(userTransactions);
        
        // Charger les objectifs d'épargne réels
        const userGoals = await SavingsService.getUserSavingsGoals(user.id);
        setSavingsGoals(userGoals);
        
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Calculer le solde total
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance || '0');
  }, 0);

  // Calculer les revenus et dépenses du mois
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(transaction => {
    if (!transaction.transactionDate) return false;
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => (t.amount || 0) > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const monthlyExpenses = Math.abs(monthlyTransactions
    .filter(t => (t.amount || 0) < 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0));

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'vacation': return 'bg-blue-500';
      case 'emergency': return 'bg-green-500';
      case 'purchase': return 'bg-purple-500';
      case 'education': return 'bg-yellow-500';
      case 'retirement': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Transfer_In':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'Withdrawal':
      case 'Transfer_Out':
      case 'Card_Purchase':
      case 'Fee':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionCategory = (type: string) => {
    switch (type) {
      case 'Deposit': return 'Dépôt';
      case 'Withdrawal': return 'Retrait';
      case 'Transfer_In': return 'Virement reçu';
      case 'Transfer_Out': return 'Virement envoyé';
      case 'Card_Purchase': return 'Achat carte';
      case 'Fee': return 'Frais';
      case 'Interest': return 'Intérêts';
      default: return 'Autre';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si aucun compte n'existe
  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-emerald-100">
            Votre compte est en cours de configuration
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun compte disponible</h3>
          <p className="text-gray-600 mb-6">
            Votre compte bancaire est en cours de création. Vous recevrez une notification dès qu'il sera disponible.
          </p>
        </div>
      </div>
    );
  }

  // Si le solde est à zéro et aucune transaction
  if (totalBalance === 0 && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-emerald-100">
            Votre compte Xbank est prêt à être utilisé
          </p>
        </div>

        {/* Solde à zéro */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Solde global</h3>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {showBalance ? formatCurrency(0) : '••••••'}
            </p>
          </div>
        </div>

        {/* Message d'invitation à recharger */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Alimentez votre compte</h4>
              <p className="text-blue-800 mb-4">
                Votre compte Xbank est prêt ! Effectuez votre premier dépôt pour commencer à utiliser tous nos services.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• Virement depuis votre banque actuelle</p>
                <p>• Dépôt par carte bancaire</p>
                <p>• Virement reçu d'un proche</p>
              </div>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Alimenter mon compte
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Découvrez Xbank</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Send className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Virement</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Mes cartes</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-purple-100 p-3 rounded-full">
                <PiggyBank className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Épargner</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-orange-100 p-3 rounded-full">
                <Plus className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Support</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour {user?.firstName} ! 👋
        </h1>
        <p className="text-emerald-100">
          Voici un aperçu de vos finances aujourd'hui
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Solde global</h3>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {showBalance ? formatCurrency(totalBalance) : '••••••'}
            </p>
            {totalBalance > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Compte actif</span>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Revenus du mois</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(monthlyIncome)}
            </p>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Dépenses du mois</h3>
            <div className="bg-red-100 p-2 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(monthlyExpenses)}
            </p>
            <p className="text-sm text-gray-500">
              {monthlyTransactions.filter(t => (t.amount || 0) < 0).length} opérations
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Send className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Virement</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Mes cartes</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-purple-100 p-3 rounded-full">
              <PiggyBank className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Épargner</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-orange-100 p-3 rounded-full">
              <Plus className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Nouveau</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
            {transactions.length > 0 && (
              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                Voir tout
              </button>
            )}
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Aucune transaction récente</p>
              <p className="text-sm text-gray-400">Vos prochaines opérations apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getTransactionIcon(transaction.type || '')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || 'Transaction'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.transactionDate ? formatDate(transaction.transactionDate) : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatCurrency(transaction.amount || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getTransactionCategory(transaction.type || '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Objectifs d'épargne</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Gérer
            </button>
          </div>
          <div className="space-y-4">
            {savingsGoals.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const color = getColorForCategory(goal.category);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{goal.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
            {savingsGoals.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Aucun objectif d'épargne</p>
                <button className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  Créer un objectif
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;