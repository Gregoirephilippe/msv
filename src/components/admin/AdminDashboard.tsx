import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { AdminService, UserStats, AccountStats, TransactionStats } from '../../services/adminService';
import { BANK_CONFIG } from '../../config/constants';
import AdminSupportSection from './AdminSupportSection';
import UserManagement from './UserManagement';
import AdminTransactionsSection from './AdminTransactionsSection';

const AdminDashboard: React.FC = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'accounts' | 'transactions' | 'support'>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!AdminService.isAdmin()) {
      window.location.href = '/admin/login';
      return;
    }

    const currentAdmin = AdminService.getCurrentAdmin();
    setAdmin(currentAdmin);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les statistiques une par une pour identifier les erreurs
      try {
        const userStatsData = await AdminService.getUserStats();
        setUserStats(userStatsData);
      } catch (error: any) {
        console.error('Erreur stats utilisateurs:', error);
        setUserStats({
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          suspendedUsers: 0,
          newUsersToday: 0,
          newUsersThisMonth: 0
        });
      }

      try {
        const accountStatsData = await AdminService.getAccountStats();
        setAccountStats(accountStatsData);
      } catch (error: any) {
        console.error('Erreur stats comptes:', error);
        setAccountStats({
          totalAccounts: 0,
          checkingAccounts: 0,
          savingsAccounts: 0,
          investmentAccounts: 0,
          totalBalance: 0,
          averageBalance: 0
        });
      }

      try {
        const transactionStatsData = await AdminService.getTransactionStats();
        setTransactionStats(transactionStatsData);
      } catch (error: any) {
        console.error('Erreur stats transactions:', error);
        setTransactionStats({
          totalTransactions: 0,
          transactionsToday: 0,
          transactionsThisMonth: 0,
          totalVolume: 0,
          volumeToday: 0,
          volumeThisMonth: 0,
          pendingTransactions: 0
        });
      }

      try {
        // Charger les utilisateurs
        const usersResult = await AdminService.getUsers(1, 50);
        setUsers(usersResult.items);
      } catch (error: any) {
        console.error('Erreur chargement utilisateurs:', error);
        setUsers([]);
      }

    } catch (error: any) {
      console.error('Erreur générale lors du chargement des données admin:', error);
      setError('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    AdminService.adminLogout();
    window.location.href = '/';
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'Pending' | 'Active' | 'Suspended' | 'Closed') => {
    try {
      await AdminService.updateUserStatus(userId, newStatus);
      await loadDashboardData(); // Recharger les données
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Suspended': return <AlertTriangle className="h-4 w-4" />;
      case 'Closed': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Si un utilisateur est sélectionné, afficher la page de gestion
  if (selectedUserId) {
    return (
      <UserManagement 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadDashboardData}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration {BANK_CONFIG.name}</h1>
                <p className="text-sm text-gray-600">Tableau de bord administrateur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Connecté en tant que:</span>
                <span className="font-medium">{admin?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'accounts', label: 'Comptes', icon: CreditCard },
              { id: 'transactions', label: 'Transactions', icon: Activity },
              { id: 'support', label: 'Support', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Utilisateurs */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Utilisateurs</h3>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{userStats?.totalUsers || 0}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600">+{userStats?.newUsersToday || 0} aujourd'hui</span>
                    <span className="text-blue-600">{userStats?.activeUsers || 0} actifs</span>
                  </div>
                </div>
              </div>

              {/* Comptes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Comptes</h3>
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{accountStats?.totalAccounts || 0}</p>
                  <div className="text-sm text-gray-600">
                    Solde total: {formatCurrency(accountStats?.totalBalance || 0)}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Transactions</h3>
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{transactionStats?.transactionsToday || 0}</p>
                  <div className="text-sm text-gray-600">
                    Aujourd'hui • {formatCurrency(transactionStats?.volumeToday || 0)}
                  </div>
                </div>
              </div>

              {/* En attente */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">En attente</h3>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {(userStats?.pendingUsers || 0) + (transactionStats?.pendingTransactions || 0)}
                  </p>
                  <div className="text-sm text-gray-600">
                    {userStats?.pendingUsers || 0} utilisateurs, {transactionStats?.pendingTransactions || 0} transactions
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques et détails */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Répartition des comptes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des comptes</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Comptes courants</span>
                    </div>
                    <span className="font-semibold">{accountStats?.checkingAccounts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Comptes épargne</span>
                    </div>
                    <span className="font-semibold">{accountStats?.savingsAccounts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">Comptes investissement</span>
                    </div>
                    <span className="font-semibold">{accountStats?.investmentAccounts || 0}</span>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {userStats?.newUsersToday || 0} nouveaux utilisateurs aujourd'hui
                      </p>
                      <p className="text-xs text-gray-500">Croissance continue</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transactionStats?.transactionsToday || 0} transactions aujourd'hui
                      </p>
                      <p className="text-xs text-gray-500">Volume: {formatCurrency(transactionStats?.volumeToday || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transactionStats?.pendingTransactions || 0} transactions en attente
                      </p>
                      <p className="text-xs text-gray-500">Nécessitent une validation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                <p className="text-gray-600">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Active">Actifs</option>
                  <option value="Pending">En attente</option>
                  <option value="Suspended">Suspendus</option>
                  <option value="Closed">Fermés</option>
                </select>
              </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users
                      .filter(user => {
                        const matchesSearch = !searchQuery || 
                          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        const matchesFilter = selectedFilter === 'all' || user.accountStatus === selectedFilter;
                        
                        return matchesSearch && matchesFilter;
                      })
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-gray-900">{user.email}</p>
                              <div className="flex items-center space-x-2">
                                {user.verified ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Vérifié
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Non vérifié
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus || 'Pending')}`}>
                              {getStatusIcon(user.accountStatus || 'Pending')}
                              <span className="ml-1">{user.accountStatus || 'Pending'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created ? formatDate(user.created) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedUserId(user.id)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="Gérer l'utilisateur"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus(user.id, 'Active')}
                                disabled={user.accountStatus === 'Active'}
                                className="text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Activer"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus(user.id, 'Suspended')}
                                disabled={user.accountStatus === 'Suspended'}
                                className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Suspendre"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600" title="Plus d'options">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion des comptes</h3>
            <p className="text-gray-600">Section en cours de développement</p>
          </div>
        )}

        {activeTab === 'transactions' && (
          <AdminTransactionsSection admin={admin} />
        )}

        {activeTab === 'support' && (
          <AdminSupportSection admin={admin} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;