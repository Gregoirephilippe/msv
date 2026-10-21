import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Search,
  AlertCircle,
  Shield,
  CreditCard,
  TrendingUp,
  Settings,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  X
} from 'lucide-react';
import { Notification } from '../../lib/pocketbase';
import { NotificationService } from '../../services/notificationService';

interface NotificationsSectionProps {
  user: any;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [notifications, selectedFilter, selectedType, searchQuery]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userNotifications = await NotificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des notifications:', error);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filtre par statut de lecture
    if (selectedFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (selectedFilter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Recherche textuelle
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(user.id);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      await NotificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Transaction': return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'Security': return <Shield className="h-5 w-5 text-red-600" />;
      case 'Marketing': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'System': return <Settings className="h-5 w-5 text-gray-600" />;
      case 'Alert': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'Transaction': return 'Transaction';
      case 'Security': return 'Sécurité';
      case 'Marketing': return 'Marketing';
      case 'System': return 'Système';
      case 'Alert': return 'Alerte';
      default: return type;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'Transaction': return 'bg-blue-100 text-blue-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'Marketing': return 'bg-purple-100 text-purple-800';
      case 'System': return 'bg-gray-100 text-gray-800';
      case 'Alert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              onClick={loadNotifications}
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
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

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
              placeholder="Rechercher dans les notifications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Statut :</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type :</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="Transaction">Transactions</option>
                <option value="Security">Sécurité</option>
                <option value="Marketing">Marketing</option>
                <option value="System">Système</option>
                <option value="Alert">Alertes</option>
              </select>
            </div>

            {(searchQuery || selectedFilter !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                  setSelectedType('all');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {notifications.length === 0 ? 'Aucune notification' : 'Aucune notification trouvée'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? 'Vos notifications apparaîtront ici'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icône */}
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type || 'System')}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getNotificationTypeColor(notification.type || 'System')
                          }`}>
                            {getNotificationTypeLabel(notification.type || 'System')}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.created ? formatDate(notification.created) : 'Date inconnue'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails notification */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Détails de la notification</h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type et statut */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getNotificationTypeColor(selectedNotification.type || 'System')
                  }`}>
                    {getNotificationIcon(selectedNotification.type || 'System')}
                    <span className="ml-2">{getNotificationTypeLabel(selectedNotification.type || 'System')}</span>
                  </span>
                  <span className={`text-sm ${selectedNotification.isRead ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                    {selectedNotification.isRead ? 'Lu' : 'Non lu'}
                  </span>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedNotification.created ? formatDate(selectedNotification.created) : 'Date inconnue'}
                  </span>
                </div>

                {/* Lien si disponible */}
                {selectedNotification.link && (
                  <div>
                    <a
                      href={selectedNotification.link}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir plus de détails →
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {!selectedNotification.isRead && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeleteNotification(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;