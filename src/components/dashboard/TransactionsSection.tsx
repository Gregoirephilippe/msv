import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Transaction, Account } from '../../lib/pocketbase';
import { TransactionService } from '../../services/transactionService';
import { AccountService } from '../../services/accountService';

interface TransactionsSectionProps {
  user: any;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadTransactionsAndAccounts();
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedAccount, selectedType, selectedStatus, dateRange]);

  const loadTransactionsAndAccounts = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les comptes et transactions
      const userAccounts = await AccountService.getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      const userTransactions = await TransactionService.getUserTransactions(user.id, 500);
      setTransactions(userTransactions);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des transactions:', error);
      setError('Erreur lors du chargement des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Recherche textuelle
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.beneficiaryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par compte
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(transaction => transaction.accountId === selectedAccount);
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus);
    }

    // Filtre par date
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(transaction => {
        if (!transaction.transactionDate) return false;
        return new Date(transaction.transactionDate) >= startDate;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset à la première page
  };

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return 'Compte inconnu';
    
    switch (account.accountType) {
      case 'Checking': return 'Compte courant';
      case 'Savings': return 'Compte épargne';
      case 'Investment': return 'Compte investissement';
      default: return account.accountType || 'Compte';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Transfer_In':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'Withdrawal':
      case 'Transfer_Out':
      case 'Card_Purchase':
      case 'Fee':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      default:
        return <MoreHorizontal className="h-5 w-5 text-gray-600" />;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Completed': return 'Terminée';
      case 'Pending': return 'En attente';
      case 'Failed': return 'Échouée';
      case 'Cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
              onClick={loadTransactionsAndAccounts}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-600">
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} 
            {filteredTransactions.length !== transactions.length && ` sur ${transactions.length}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par description, bénéficiaire ou référence..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Bouton filtres */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(searchQuery || selectedAccount !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || dateRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAccount('all');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setDateRange('all');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Filtre par compte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compte</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Tous les comptes</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountName(account.id)} (•••• {account.accountNumber?.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="Deposit">Dépôts</option>
                  <option value="Withdrawal">Retraits</option>
                  <option value="Transfer_In">Virements reçus</option>
                  <option value="Transfer_Out">Virements envoyés</option>
                  <option value="Card_Purchase">Achats carte</option>
                  <option value="Fee">Frais</option>
                  <option value="Interest">Intérêts</option>
                </select>
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Completed">Terminées</option>
                  <option value="Pending">En attente</option>
                  <option value="Failed">Échouées</option>
                  <option value="Cancelled">Annulées</option>
                </select>
              </div>

              {/* Filtre par période */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="quarter">3 derniers mois</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-xl shadow-sm border">
        {currentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filteredTransactions.length === 0 && transactions.length > 0 
                ? 'Aucune transaction trouvée' 
                : 'Aucune transaction'
              }
            </h3>
            <p className="text-gray-600">
              {filteredTransactions.length === 0 && transactions.length > 0
                ? 'Essayez de modifier vos critères de recherche'
                : 'Vos prochaines transactions apparaîtront ici'
              }
            </p>
          </div>
        ) : (
          <>
            {/* En-têtes */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div>Date</div>
              <div>Description</div>
              <div>Compte</div>
              <div>Type</div>
              <div>Statut</div>
              <div className="text-right">Montant</div>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Version mobile */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          {getTransactionIcon(transaction.type || '')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description || 'Transaction'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getTransactionCategory(transaction.type || '')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatCurrency(transaction.amount || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{getAccountName(transaction.accountId || '')}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status || '')}`}>
                          {getStatusIcon(transaction.status || '')}
                          <span className="ml-1">{getStatusLabel(transaction.status || '')}</span>
                        </span>
                      </div>
                      <span>
                        {transaction.transactionDate ? formatDateShort(transaction.transactionDate) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Version desktop */}
                  <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                    <div className="text-sm text-gray-900">
                      {transaction.transactionDate ? formatDateShort(transaction.transactionDate) : 'N/A'}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        {getTransactionIcon(transaction.type || '')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description || 'Transaction'}
                        </p>
                        {transaction.beneficiaryName && (
                          <p className="text-sm text-gray-500">
                            {transaction.beneficiaryName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {getAccountName(transaction.accountId || '')}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {getTransactionCategory(transaction.type || '')}
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status || '')}`}>
                        {getStatusIcon(transaction.status || '')}
                        <span className="ml-1">{getStatusLabel(transaction.status || '')}</span>
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatCurrency(transaction.amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTransactions.length)} sur {filteredTransactions.length} transactions
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === pageNum
                                ? 'bg-emerald-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détails transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Détails de la transaction</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations principales */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-white p-3 rounded-full">
                      {getTransactionIcon(selectedTransaction.type || '')}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedTransaction.description || 'Transaction'}
                      </h4>
                      <p className="text-gray-600">
                        {getTransactionCategory(selectedTransaction.type || '')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status || '')}`}>
                      {getStatusIcon(selectedTransaction.status || '')}
                      <span className="ml-2">{getStatusLabel(selectedTransaction.status || '')}</span>
                    </span>
                    <p className={`text-2xl font-bold ${(selectedTransaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatCurrency(selectedTransaction.amount || 0)}
                    </p>
                  </div>
                </div>

                {/* Détails */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">
                        {selectedTransaction.transactionDate ? formatDate(selectedTransaction.transactionDate) : 'Non définie'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compte</label>
                      <p className="text-gray-900">
                        {getAccountName(selectedTransaction.accountId || '')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                      <p className="text-gray-900">{selectedTransaction.currency || 'EUR'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedTransaction.beneficiaryName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire</label>
                        <p className="text-gray-900">{selectedTransaction.beneficiaryName}</p>
                      </div>
                    )}
                    
                    {selectedTransaction.beneficiaryIBAN && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IBAN bénéficiaire</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedTransaction.beneficiaryIBAN}</p>
                      </div>
                    )}
                    
                    {selectedTransaction.reference && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                        <p className="text-gray-900">{selectedTransaction.reference}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID de transaction */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    ID de transaction : {selectedTransaction.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsSection;