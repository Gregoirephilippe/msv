import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  Plus, 
  MoreHorizontal, 
  Copy, 
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { AccountService } from '../../services/accountService';
import { TransactionService } from '../../services/transactionService';
import { Account, Transaction } from '../../lib/pocketbase';

interface AccountsSectionProps {
  user: any;
}

const AccountsSection: React.FC<AccountsSectionProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [user?.id]);

  useEffect(() => {
    if (selectedAccount) {
      loadAccountTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userAccounts = await AccountService.getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      // Sélectionner le premier compte par défaut
      if (userAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(userAccounts[0]);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des comptes:', error);
      setError('Erreur lors du chargement des comptes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountTransactions = async (accountId: string) => {
    try {
      setIsLoadingTransactions(true);
      const transactions = await TransactionService.getAccountTransactions(accountId, 10);
      setAccountTransactions(transactions);
    } catch (error: any) {
      console.error('Erreur lors du chargement des transactions:', error);
      setAccountTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numAmount);
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Format IBAN français avec espaces
    return accountNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'Checking': return 'Compte courant';
      case 'Savings': return 'Compte épargne';
      case 'Investment': return 'Compte investissement';
      default: return type;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'Checking': return Wallet;
      case 'Savings': return TrendingUp;
      case 'Investment': return TrendingDown;
      default: return Wallet;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Transfer_In':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Withdrawal':
      case 'Transfer_Out':
      case 'Card_Purchase':
      case 'Fee':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-gray-600" />;
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
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadAccounts}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun compte disponible</h3>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas encore de compte bancaire. Contactez notre support pour en créer un.
        </p>
        <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors">
          Contacter le support
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mes comptes</h2>
        <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouveau compte</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des comptes */}
        <div className="lg:col-span-1 space-y-4">
          {accounts.map((account) => {
            const AccountIcon = getAccountTypeIcon(account.accountType || 'Checking');
            const balance = parseFloat(account.balance || '0');
            const isSelected = selectedAccount?.id === account.id;
            
            return (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <AccountIcon className={`h-5 w-5 ${isSelected ? 'text-emerald-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getAccountTypeLabel(account.accountType || 'Checking')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        •••• {account.accountNumber?.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Solde disponible</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {showBalance ? formatCurrency(balance) : '••••••'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Détails du compte sélectionné */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAccount && (
            <>
              {/* Informations du compte */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détails du compte
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IBAN
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono">
                          {formatAccountNumber(selectedAccount.accountNumber || '')}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedAccount.accountNumber || '', 'iban')}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copier l'IBAN"
                        >
                          {copiedField === 'iban' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de compte
                      </label>
                      <p className="text-gray-900">
                        {getAccountTypeLabel(selectedAccount.accountType || 'Checking')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Devise
                      </label>
                      <p className="text-gray-900">{selectedAccount.currency || 'EUR'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'ouverture
                      </label>
                      <p className="text-gray-900">
                        {selectedAccount.created ? formatDate(selectedAccount.created) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>RIB</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      <CreditCard className="h-4 w-4" />
                      <span>Commander une carte</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                      <span>Plus d'options</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions récentes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transactions récentes
                  </h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    Voir tout l'historique
                  </button>
                </div>

                {isLoadingTransactions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : accountTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Aucune transaction récente</p>
                    <p className="text-sm text-gray-400">
                      Les prochaines opérations sur ce compte apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accountTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-2 rounded-full">
                            {getTransactionIcon(transaction.type || '')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description || 'Transaction'}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getTransactionCategory(transaction.type || '')}</span>
                              <span>•</span>
                              <span>
                                {transaction.transactionDate ? formatDate(transaction.transactionDate) : 'Date inconnue'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {formatCurrency(transaction.amount || 0)}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {transaction.status?.toLowerCase() || 'pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsSection;