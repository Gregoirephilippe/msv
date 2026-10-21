import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  MessageCircle, 
  Send,
  Loader2,
  X,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { SupportChatService } from '../../services/supportChatService';
import { AdminService } from '../../services/adminService';
import { BANK_CONFIG } from '../../config/constants';

interface UserActionsProps {
  user: any;
  admin: any;
  onStatusUpdate: (status: 'Pending' | 'Active' | 'Suspended' | 'Closed') => void;
  isUpdatingStatus: boolean;
  onUserUpdate: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  admin,
  onStatusUpdate,
  isUpdatingStatus,
  onUserUpdate
}) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatForm, setChatForm] = useState({
    agentName: `Support ${BANK_CONFIG.name}`,
    message: ''
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatSuccess, setChatSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatForm.message.trim() || !chatForm.agentName.trim()) {
      setChatError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSendingMessage(true);
      setChatError(null);
      
      await SupportChatService.sendAdminMessage(
        user.id,
        chatForm.message.trim(),
        chatForm.agentName.trim(),
        admin.id
      );
      
      setChatSuccess('Message envoyé avec succès !');
      
      // Reset du formulaire
      setChatForm({
        agentName: `Support ${BANK_CONFIG.name}`,
        message: ''
      });
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setShowChatModal(false);
        setChatSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setChatError(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir ${user.verified ? 'annuler la vérification' : 'vérifier'} de cet utilisateur ?`)) {
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError(null);
      
      if (user.verified) {
        await AdminService.unverifyUser(user.id);
        setVerifySuccess('Vérification annulée avec succès');
      } else {
        await AdminService.verifyUser(user.id);
        setVerifySuccess('Utilisateur vérifié avec succès');
      }
      
      onUserUpdate();
      
      setTimeout(() => setVerifySuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      setVerifyError(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {/* Messages de vérification */}
      {verifySuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{verifySuccess}</p>
          </div>
        </div>
      )}

      {verifyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{verifyError}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onStatusUpdate('Active')}
            disabled={user.accountStatus === 'Active' || isUpdatingStatus}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Activer</span>
          </button>
          
          <button
            onClick={() => onStatusUpdate('Suspended')}
            disabled={user.accountStatus === 'Suspended' || isUpdatingStatus}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          >
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Suspendre</span>
          </button>
          
          <button
            onClick={() => onStatusUpdate('Closed')}
            disabled={user.accountStatus === 'Closed' || isUpdatingStatus}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          >
            <div className="bg-gray-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Fermer</span>
          </button>
          
          <button
            onClick={handleVerifyUser}
            disabled={isVerifying}
            className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-colors border border-gray-200 ${
              user.verified 
                ? 'hover:bg-orange-50' 
                : 'hover:bg-blue-50'
            }`}
          >
            <div className={`p-3 rounded-full ${
              user.verified 
                ? 'bg-orange-100' 
                : 'bg-blue-100'
            }`}>
              {isVerifying ? (
                <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
              ) : user.verified ? (
                <UserX className="h-6 w-6 text-orange-600" />
              ) : (
                <UserCheck className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user.verified ? 'Annuler vérif.' : 'Vérifier'}
            </span>
          </button>
          
          <button
            onClick={() => setShowChatModal(true)}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200"
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Message</span>
          </button>
        </div>
      </div>

      {/* Modal de chat */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Envoyer un message</h3>
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setChatError(null);
                    setChatSuccess(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Message à :</p>
                    <p className="text-sm text-blue-700">
                      {user.firstName} {user.lastName} ({user.email})
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Le message apparaîtra dans la section Support du client
                    </p>
                  </div>
                </div>
              </div>

              {chatSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-800">{chatSuccess}</p>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{chatError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'agent (affiché chez le client) *
                  </label>
                  <input
                    type="text"
                    value={chatForm.agentName}
                    onChange={(e) => setChatForm(prev => ({ ...prev, agentName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Sarah - Support Xbank"
                    required
                    disabled={isSendingMessage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={chatForm.message}
                    onChange={(e) => setChatForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                    placeholder="Tapez votre message..."
                    required
                    disabled={isSendingMessage}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChatModal(false);
                      setChatError(null);
                      setChatSuccess(null);
                    }}
                    disabled={isSendingMessage}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingMessage || !chatForm.message.trim() || !chatForm.agentName.trim()}
                    className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserActions;