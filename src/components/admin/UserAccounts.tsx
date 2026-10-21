import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Euro,
  Calendar,
  Eye,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserAccountsProps {
  accounts: any[];
  cards: any[];
  transactions: any[];
  isLoading: boolean;
}

const UserAccounts: React.FC<UserAccountsProps> = ({
  accounts,
  cards,
  transactions,
  isLoading
}) => {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      case 'Investment': return TrendingUp;
      default: return Wallet;
    }
  };

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comptes bancaires */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comptes bancaires</h3>
        
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun compte bancaire</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const AccountIcon = getAccountTypeIcon(account.accountType);
              const balance = parseFloat(account.balance || '0');
              
              return (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <AccountIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getAccountTypeLabel(account.accountType)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          •••• {account.accountNumber?.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ouvert le {account.created ? formatDate(account.created) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(balance)}
                      </p>
                      <p className="text-sm text-gray-500">{account.currency || 'EUR'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cartes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cartes bancaires</h3>
        
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune carte bancaire</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Carte {card.cardType}
                      </h4>
                      <p className="text-sm text-gray-500 font-mono">
                        •••• •••• •••• {card.cardNumber?.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Expire {card.expirationMonth?.toString().padStart(2, '0')}/{card.expirationYear?.toString().slice(-2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCardStatusColor(card.status)}`}>
                      {card.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Créée le {card.created ? formatDate(card.created) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Euro className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune transaction récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    (transaction.amount || 0) > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Euro className={`h-4 w-4 ${
                      (transaction.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
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
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.status?.toLowerCase() || 'pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccounts;