import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { NotificationService } from '../../services/notificationService';
import { Notification } from '../../lib/pocketbase';
import { BANK_CONFIG } from '../../config/constants';

interface HeaderProps {
  user: any;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingNotifications(true);
      const userNotifications = await NotificationService.getUserNotifications(user.id, 10);
      setNotifications(userNotifications);
      
      const count = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Transaction': return '💳';
      case 'Security': return '🔒';
      case 'Marketing': return '📢';
      case 'System': return '⚙️';
      case 'Alert': return '⚠️';
      default: return '🔔';
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la recherche
    console.log('Recherche:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo (mobile) */}
        <div className="lg:hidden">
          <h1 className="text-xl font-bold text-gray-900">{BANK_CONFIG.name}</h1>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une transaction, un contact..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Icon (mobile) */}
          <button className="md:hidden p-2 text-gray-400 hover:text-gray-600">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
            <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {isNotificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await NotificationService.markAllAsRead(user.id);
                          await loadNotifications();
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingNotifications ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification.id);
                          }
                          setIsNotificationMenuOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          !notification.isRead ? 'border-l-blue-500 bg-blue-50' : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">
                            {getNotificationIcon(notification.type || 'System')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {notification.message && notification.message.length > 80 
                                ? `${notification.message.substring(0, 80)}...` 
                                : notification.message
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.created ? formatDate(notification.created) : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length > 5 && (
                      <div className="px-4 py-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setIsNotificationMenuOpen(false);
                            // TODO: Naviguer vers la section notifications
                          }}
                          className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Voir toutes les notifications ({notifications.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Mon profil</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </button>
                <hr className="my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isNotificationMenuOpen) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;