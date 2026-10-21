import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  User,
  CreditCard,
  Send,
  Euro,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { pb } from '../../lib/pocketbase';
import { AdminService } from '../../services/adminService';

interface AdminTransactionsSectionProps {
  admin: any;
}

const AdminTransactionsSection: React.FC<AdminTransactionsSectionProps> = ({ admin }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadTransactionsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedStatus, selectedType, dateRange]);

  const loadTransactionsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les transactions directement depuis PocketBase
      const transactionsResult = await pb.collection('Transactions').getList(1, 500, {
        sort: '-created'
      });
      setTransactions(transactionsResult.items);
      
      // Charger les utilisateurs pour avoir les noms
      const usersResult = await AdminService.getUsers(1, 500);
      setUsers(usersResult.items);
      
      // Charger les comptes pour avoir les détails
      const accountsResult = await pb.collection('Accounts').getList(1, 500, {
        sort: '-created'
      });
      setAccounts(accountsResult.items);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des transactions:', error);
      setError('Erreur lors du chargement des transactions: ' + error.message);
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
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUserName(transaction.accountId)?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus);
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
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
      }
      
      filtered = filtered.filter(transaction => {
        if (!transaction.transactionDate) return false;
        return new Date(transaction.transactionDate) >= startDate;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleApproveTransaction = async (transactionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette transaction ?')) {
      return;
    }

    try {
      setIsProcessing(transactionId);
      setError(null);
      
      // Mettre à jour le statut de la transaction
      const updatedTransaction = await pb.collection('Transactions').update(transactionId, {
        status: 'Completed'
      });

      // Récupérer la transaction pour mettre à jour le solde
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        const account = accounts.find(acc => acc.id === transaction.accountId);
        if (account) {
          const currentBalance = parseFloat(account.balance || '0');
          const newBalance = currentBalance + (transaction.amount || 0);
          
          await pb.collection('Accounts').update(transaction.accountId, {
            balance: newBalance.toFixed(2)
          });
        }
      }
      
      setSuccess('Transaction approuvée avec succès');
      await loadTransactionsData();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      setError('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    const reason = prompt('Raison du rejet (optionnel):');
    
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette transaction ?')) {
      return;
    }

    try {
      setIsProcessing(transactionId);
      setError(null);
      
      await pb.collection('Transactions').update(transactionId, {
        status: 'Failed',
        description: reason ? `${transaction.description || 'Transaction'} - Rejetée: ${reason}` : transaction.description
      });
      
      setSuccess('Transaction rejetée');
      await loadTransactionsData();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      setError('Erreur lors du rejet: ' + error.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const getUserName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return 'Utilisateur inconnu';
    
    const user = users.find(u => u.id === account.userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
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
      case 'Interest':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'Withdrawal':
      case 'Transfer_Out':
      case 'Card_Purchase':
      case 'Fee':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'Deposit': return 'Dépôt';
      case 'Withdrawal': return 'Retrait';
      case 'Transfer_In': return 'Virement reçu';
      case 'Transfer_Out': return 'Virement envoyé';
      case 'Card_Purchase': return 'Achat carte';
      case 'Fee': return 'Frais';
      case 'Interest': return 'Intérêts';
      default: return type;
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

  // Statistiques
  const pendingCount = transactions.filter(t => t.status === 'Pending').length;
  const completedToday = transactions.filter(t => {
    if (!t.transactionDate) return false;
    const today = new Date().toDateString();
    return new Date(t.transactionDate).toDateString() === today && t.status === 'Completed';
  }).length;
  const totalVolumeToday = transactions
    .filter(t => {
      if (!t.transactionDate) return false;
      const today = new Date().toDateString();
      return new Date(t.transactionDate).toDateString() === today;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

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
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadTransactionsData}
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
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des transactions</h2>
            <p className="text-gray-600">Supervision et validation des opérations bancaires</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadTransactionsData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">En attente</p>
                <p className="text-2xl font-bold text-orange-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Aujourd'hui</p>
                <p className="text-2xl font-bold text-green-900">{completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <Euro className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Volume aujourd'hui</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(totalVolumeToday)}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Total</p>
                <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par description, bénéficiaire, utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Bouton filtres */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres avancés</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(searchQuery || selectedStatus !== 'all' || selectedType !== 'all' || dateRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedType('all');
                  setDateRange('all');
                }}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Pending">En attente</option>
                  <option value="Completed">Terminées</option>
                  <option value="Failed">Échouées</option>
                  <option value="Cancelled">Annulées</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actions rapides</label>
                <button
                  onClick={() => setSelectedStatus('Pending')}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Voir en attente ({pendingCount})
                </button>
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
              <Activity className="h-8 w-8 text-gray-400" />
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
                : 'Les transactions apparaîtront ici'
              }
            </p>
          </div>
        ) : (
          <>
            {/* En-têtes desktop */}
            <div className="hidden lg:grid lg:grid-cols-7 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div>Date</div>
              <div>Utilisateur</div>
              <div>Description</div>
              <div>Type</div>
              <div>Montant</div>
              <div>Statut</div>
              <div>Actions</div>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Version mobile */}
                  <div className="lg:hidden space-y-3">
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
                            {getUserName(transaction.accountId || '')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatCurrency(transaction.amount || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status || '')}`}>
                          {getStatusIcon(transaction.status || '')}
                          <span className="ml-1">{getStatusLabel(transaction.status || '')}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {transaction.transactionDate ? formatDateShort(transaction.transactionDate) : 'N/A'}
                        </span>
                      </div>
                      
                      {transaction.status === 'Pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveTransaction(transaction.id)}
                            disabled={isProcessing === transaction.id}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                          >
                            {isProcessing === transaction.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Approuver'
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(transaction.id)}
                            disabled={isProcessing === transaction.id}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:bg-gray-300 transition-colors"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Version desktop */}
                  <div className="hidden lg:grid lg:grid-cols-7 gap-4 items-center">
                    <div className="text-sm text-gray-900">
                      {transaction.transactionDate ? formatDateShort(transaction.transactionDate) : 'N/A'}
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{getUserName(transaction.accountId || '')}</p>
                      <p className="text-gray-500">{getAccountName(transaction.accountId || '')}</p>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {transaction.description || 'Transaction'}
                      </p>
                      {transaction.beneficiaryName && (
                        <p className="text-gray-500">→ {transaction.beneficiaryName}</p>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type || '')}
                        <span className="text-gray-700">{getTransactionTypeLabel(transaction.type || '')}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatCurrency(transaction.amount || 0)}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status || '')}`}>
                        {getStatusIcon(transaction.status || '')}
                        <span className="ml-1">{getStatusLabel(transaction.status || '')}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {transaction.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveTransaction(transaction.id)}
                            disabled={isProcessing === transaction.id}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center space-x-1"
                          >
                            {isProcessing === transaction.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Approuver</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(transaction.id)}
                            disabled={isProcessing === transaction.id}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:bg-gray-300 transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Rejeter</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
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
                                ? 'bg-red-500 text-white'
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
                        {getTransactionTypeLabel(selectedTransaction.type || '')}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                      <p className="text-gray-900">{getUserName(selectedTransaction.accountId || '')}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compte</label>
                      <p className="text-gray-900">{getAccountName(selectedTransaction.accountId || '')}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">
                        {selectedTransaction.transactionDate ? formatDate(selectedTransaction.transactionDate) : 'Non définie'}
                      </p>
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

                {/* Actions admin */}
                {selectedTransaction.status === 'Pending' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          handleApproveTransaction(selectedTransaction.id);
                          setSelectedTransaction(null);
                        }}
                        disabled={isProcessing === selectedTransaction.id}
                        className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approuver la transaction</span>
                      </button>
                      <button
                        onClick={() => {
                          handleRejectTransaction(selectedTransaction.id);
                          setSelectedTransaction(null);
                        }}
                        disabled={isProcessing === selectedTransaction.id}
                        className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Rejeter la transaction</span>
                      </button>
                    </div>
                  </div>
                )}

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

export default AdminTransactionsSection;