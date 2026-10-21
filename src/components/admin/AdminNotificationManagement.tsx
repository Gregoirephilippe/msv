import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Send, 
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Shield,
  CreditCard,
  TrendingUp,
  Settings,
  Trash2
} from 'lucide-react';
import { NotificationService } from '../../services/notificationService';
import { Notification } from '../../lib/pocketbase';
import { BANK_CONFIG } from '../../config/constants';

interface AdminNotificationManagementProps {
  userId: string;
  user: any;
}

const AdminNotificationManagement: React.FC<AdminNotificationManagementProps> = ({
  userId,
  user
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [notificationForm, setNotificationForm] = useState({
    type: 'System' as 'Transaction' | 'Security' | 'Marketing' | 'System' | 'Alert',
    message: '',
    link: ''
  });

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userNotifications = await NotificationService.getUserNotifications(userId);
      setNotifications(userNotifications);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des notifications:', error);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationForm.message.trim()) {
      setError('Le message est obligatoire');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      
      await NotificationService.createNotification(
        userId,
        notificationForm.type,
        `[ADMIN] ${notificationForm.message.trim()}`,
        notificationForm.link || undefined
      );
      
      setSuccess(`Notification ${getNotificationTypeLabel(notificationForm.type)} envoyée avec succès`);
      setNotificationForm({
        type: 'System',
        message: '',
        link: ''
      });
      setShowCreateForm(false);
      await loadNotifications();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      setError(error.message || 'Erreur lors de l\'envoi de la notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      await NotificationService.deleteNotification(notificationId);
      setSuccess('Notification supprimée avec succès');
      await loadNotifications();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.message || 'Erreur lors de la suppression de la notification');
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const predefinedMessages = [
    {
      type: 'System' as const,
      message: 'Votre compte a été vérifié avec succès. Vous pouvez maintenant utiliser tous nos services.',
      label: 'Compte vérifié'
    },
    {
      type: 'Security' as const,
      message: 'Votre mot de passe a été modifié avec succès. Si ce n\'était pas vous, contactez-nous immédiatement.',
      label: 'Mot de passe modifié'
    },
    {
      type: 'Transaction' as const,
      message: 'Votre virement a été traité avec succès.',
      label: 'Virement traité'
    },
    {
      type: 'Alert' as const,
      message: 'Votre compte nécessite une action de votre part. Veuillez vous connecter pour plus d\'informations.',
      label: 'Action requise'
    },
    {
      type: 'Marketing' as const,
      message: `Découvrez nos nouveaux services d'épargne ${BANK_CONFIG.name} avec un taux préférentiel de 4.5% APY.`,
      label: 'Nouvelle offre épargne'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Gestion des notifications</h3>
          <p className="text-gray-600">
            Envoyez des notifications à {user.firstName} {user.lastName}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle notification</span>
        </button>
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
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Messages prédéfinis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Messages prédéfinis</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {predefinedMessages.map((template, index) => (
            <button
              key={index}
              onClick={() => {
                setNotificationForm({
                  type: template.type,
                  message: template.message,
                  link: ''
                });
                setShowCreateForm(true);
              }}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-2">
                {getNotificationIcon(template.type)}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(template.type)}`}>
                  {getNotificationTypeLabel(template.type)}
                </span>
              </div>
              <h5 className="font-medium text-gray-900 mb-1">{template.label}</h5>
              <p className="text-sm text-gray-600">{template.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Historique des notifications */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Notifications envoyées ({notifications.length})
        </h4>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification envoyée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-lg ${
                !notification.isRead ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}>
                <div className="bg-white p-2 rounded-full border">
                  {getNotificationIcon(notification.type || 'System')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getNotificationTypeColor(notification.type || 'System')
                    }`}>
                      {getNotificationTypeLabel(notification.type || 'System')}
                    </span>
                    {!notification.isRead && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Non lue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.created ? formatDate(notification.created) : 'Date inconnue'}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création de notification */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvelle notification</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Destinataire :</p>
                    <p className="text-sm text-blue-700">
                      {user.firstName} {user.lastName} ({user.email})
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      La notification apparaîtra dans l'espace client de l'utilisateur
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de notification *
                  </label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="System">Système</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Security">Sécurité</option>
                    <option value="Alert">Alerte</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={4}
                    placeholder="Tapez votre message..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le préfixe [ADMIN] sera automatiquement ajouté au message
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien (optionnel)
                  </label>
                  <input
                    type="url"
                    value={notificationForm.link}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lien vers une page spécifique (optionnel)
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Notification administrative</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Cette notification sera envoyée immédiatement à l'utilisateur et apparaîtra dans son espace client.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isSending}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !notificationForm.message.trim()}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Envoyer la notification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationManagement;