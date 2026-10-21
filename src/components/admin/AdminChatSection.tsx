import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { SupportChatService, SupportMessage } from '../../services/supportChatService';

import { BANK_CONFIG } from '../../config/constants';

interface AdminChatSectionProps {
  userId: string;
  user: any;
  admin: any;
}

const AdminChatSection: React.FC<AdminChatSectionProps> = ({ userId, user, admin }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState(`${admin?.email?.split('@')[0] || 'Admin'} - Support ${BANK_CONFIG.name}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Actualiser toutes les 10 secondes
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userMessages = await SupportChatService.getUserMessages(userId);
      setMessages(userMessages);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      // Envoyer le message de l'agent
      await SupportChatService.sendAdminMessage(
        userId,
        messageContent,
        agentName,
        admin.id
      );

      // Recharger les messages
      await loadMessages();
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message admin:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await SupportChatService.markConversationAsRead(userId, `conv_${userId}`);
      await loadMessages();
    } catch (error: any) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (messageType: string, agentId?: string) => {
    if (messageType === 'user_message') {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
      );
    } else {
      if (agentId === 'system') {
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-gray-600" />
          </div>
        );
      } else {
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-red-600" />
          </div>
        );
      }
    }
  };

  const unreadUserMessages = messages.filter(m => 
    m.messageType === 'user_message' && !m.isRead
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Chat avec l'utilisateur</h3>
          <p className="text-gray-600">
            Conversation avec {user.firstName} {user.lastName} ({user.email})
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadUserMessages > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Marquer comme lu ({unreadUserMessages})</span>
            </button>
          )}
          <button
            onClick={loadMessages}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">Informations client</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-medium">Nom complet</p>
                <p className="text-blue-800">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Email</p>
                <p className="text-blue-800">{user.email}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Statut</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.accountStatus === 'Active' ? 'bg-green-100 text-green-800' : 
                  user.accountStatus === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {user.accountStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interface de chat */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="h-[600px] flex flex-col">
          {/* Header du chat */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <MessageCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Support ${BANK_CONFIG.name} - Mode Admin</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">En ligne</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Nom de l'agent"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Chargement de la conversation...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Erreur de chargement</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button 
                      onClick={loadMessages}
                      className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez la conversation avec {user.firstName} en envoyant un message.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm max-w-md mx-auto">
                  <div className="text-center">
                    <div className="bg-blue-100 p-2 rounded-full w-8 h-8 mx-auto mb-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Chat direct</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-2 rounded-full w-8 h-8 mx-auto mb-2">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-gray-600">Support téléphone</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-2 rounded-full w-8 h-8 mx-auto mb-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-gray-600">Support email</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.messageType === 'user_message' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                      message.messageType === 'agent_response' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {getMessageIcon(message.messageType, message.agentId)}
                      <div className={`rounded-lg px-4 py-2 ${
                        message.messageType === 'user_message'
                          ? 'bg-white border border-gray-200 text-gray-900'
                          : message.agentId === 'system'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-red-500 text-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className={`text-xs font-medium ${
                            message.messageType === 'user_message' ? 'text-blue-600' : 
                            message.agentId === 'system' ? 'text-gray-600' : 'text-red-100'
                          }`}>
                            {message.authorName}
                          </p>
                          {message.messageType === 'user_message' && !message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.messageType === 'user_message' ? 'text-gray-500' : 
                          message.agentId === 'system' ? 'text-gray-500' : 'text-red-100'
                        }`}>
                          {message.created ? formatTime(message.created) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="space-y-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Répondre au client..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    disabled={isSending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Entrée pour envoyer • Maj+Entrée pour nouvelle ligne</span>
                <span>Connecté en tant que : {agentName}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Messages prédéfinis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Messages rapides</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
            "Votre demande a été prise en compte et sera traitée dans les plus brefs délais.",
            "Votre compte a été vérifié avec succès. Vous pouvez maintenant utiliser tous nos services.",
            "Nous avons bien reçu votre demande. Un spécialiste va vous recontacter sous 24h.",
            "Votre problème a été résolu. N'hésitez pas à nous recontacter si besoin.",
            "Merci pour votre patience. Votre dossier est en cours de traitement."
          ].map((template, index) => (
            <button
              key={index}
              onClick={() => setNewMessage(template)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-sm"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques de la conversation */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages totaux</h3>
              <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages non lus</h3>
              <p className="text-2xl font-bold text-orange-600">{unreadUserMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Dernière activité</h3>
              <p className="text-sm text-gray-600">
                {messages.length > 0 && messages[messages.length - 1].created 
                  ? formatTime(messages[messages.length - 1].created!) 
                  : 'Aucune'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatSection;