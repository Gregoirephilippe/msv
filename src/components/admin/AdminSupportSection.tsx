import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Archive,
  Star,
  Phone,
  Mail,
  X,
  Bot,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw,
  Settings
} from 'lucide-react';
import { SupportChatService, SupportMessage } from '../../services/supportChatService';
import { AdminService } from '../../services/adminService';

interface AdminSupportSectionProps {
  admin: any;
}

interface AdminConversation {
  id: string;
  messages: SupportMessage[];
  lastMessage?: SupportMessage;
  isActive: boolean;
  userInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accountStatus: string;
  };
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const AdminSupportSection: React.FC<AdminSupportSectionProps> = ({ admin }) => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AdminConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [agentName, setAgentName] = useState(`Support ${BANK_CONFIG.name}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supportResult = await AdminService.getSupportConversations(500);
      const allMessages = supportResult.items as SupportMessage[];
      
      const conversationsMap = new Map<string, {
        messages: SupportMessage[];
        userId: string;
      }>();
      
      allMessages.forEach(message => {
        if (!conversationsMap.has(message.conversationId)) {
          conversationsMap.set(message.conversationId, {
            messages: [],
            userId: message.userId
          });
        }
        conversationsMap.get(message.conversationId)!.messages.push(message);
      });

      const userIds = Array.from(new Set(allMessages.map(m => m.userId)));
      const usersPromises = userIds.map(async (userId) => {
        try {
          const usersResult = await AdminService.getUsers(1, 1, `id = "${userId}"`);
          return usersResult.items[0] || null;
        } catch {
          return null;
        }
      });
      
      const users = await Promise.all(usersPromises);
      const usersMap = new Map();
      users.forEach(user => {
        if (user) usersMap.set(user.id, user);
      });

      const adminConversations: AdminConversation[] = [];
      
      conversationsMap.forEach((data, conversationId) => {
        const messages = data.messages.sort((a, b) => 
          new Date(a.created || '').getTime() - new Date(b.created || '').getTime()
        );
        
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(m => 
          m.messageType === 'user_message' && !m.isRead
        ).length;
        
        const userInfo = usersMap.get(data.userId);
        const priority = determinePriority(messages);
        const category = determineCategory(messages);
        
        adminConversations.push({
          id: conversationId,
          messages,
          lastMessage,
          isActive: true,
          userInfo,
          unreadCount,
          priority,
          category
        });
      });

      adminConversations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        const aTime = a.lastMessage?.created || '0';
        const bTime = b.lastMessage?.created || '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(adminConversations);
      
      if (adminConversations.length > 0 && !activeConversation) {
        setActiveConversation(adminConversations[0]);
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des conversations admin:', error);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation || isSending) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await SupportChatService.sendAdminMessage(
        activeConversation.userInfo?.id || '',
        messageContent,
        agentName,
        admin.id
      );

      await loadConversations();
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message admin:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const markConversationAsRead = async (conversationId: string, userId: string) => {
    try {
      await SupportChatService.markConversationAsRead(userId, conversationId);
      await loadConversations();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return 'Normal';
    }
  };

  const getMessageIcon = (messageType: string, agentId?: string) => {
    if (messageType === 'user_message') {
      return (
        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
      );
    } else {
      if (agentId === 'system') {
        return (
          <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
        );
      } else {
        return (
          <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Settings className="h-4 w-4 text-white" />
          </div>
        );
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.userInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'unread' && conv.unreadCount > 0) ||
      (selectedFilter === 'priority' && conv.priority === 'high');
    
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const highPriorityCount = conversations.filter(conv => conv.priority === 'high').length;

  const quickReplies = [
    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "Votre demande a été prise en compte et sera traitée dans les plus brefs délais.",
    "Votre compte a été vérifié avec succès.",
    "Nous avons bien reçu votre demande. Un spécialiste va vous recontacter sous 24h.",
    "Votre problème a été résolu. N'hésitez pas à nous recontacter si besoin.",
    "Merci pour votre patience. Votre dossier est en cours de traitement."
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du support...</p>
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
              onClick={loadConversations}
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
            <h2 className="text-2xl font-bold text-gray-900">Support client</h2>
            <p className="text-gray-600">Gestion des conversations et assistance</p>
          </div>
          <button
            onClick={loadConversations}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Conversations</p>
                <p className="text-xl font-bold text-gray-900">{conversations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Non lues</p>
                <p className="text-xl font-bold text-gray-900">{totalUnread}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-xl font-bold text-gray-900">{highPriorityCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-xl font-bold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interface principale */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex h-[700px]">
          {/* Sidebar des conversations */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header sidebar */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une conversation..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="all">Toutes les conversations</option>
                  <option value="unread">Non lues uniquement</option>
                  <option value="priority">Priorité haute</option>
                </select>
              </div>
            </div>

            {/* Liste des conversations avec scroll */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aucune conversation</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setActiveConversation(conversation);
                        if (conversation.unreadCount > 0) {
                          markConversationAsRead(conversation.id, conversation.userInfo?.id || '');
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeConversation?.id === conversation.id
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.userInfo 
                                ? `${conversation.userInfo.firstName} ${conversation.userInfo.lastName}`
                                : 'Utilisateur inconnu'
                              }
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {conversation.lastMessage?.created ? formatTime(conversation.lastMessage.created) : ''}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 truncate mb-2">
                            {conversation.lastMessage?.content || 'Nouvelle conversation'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(conversation.priority)}`}>
                              {getPriorityLabel(conversation.priority)}
                            </span>
                            <span className="text-xs text-gray-500">{conversation.category}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone de chat principale */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Header de la conversation active */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {activeConversation.userInfo 
                            ? `${activeConversation.userInfo.firstName} ${activeConversation.userInfo.lastName}`
                            : 'Utilisateur inconnu'
                          }
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{activeConversation.userInfo?.email}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activeConversation.userInfo?.accountStatus === 'Active' ? 'bg-green-100 text-green-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {activeConversation.userInfo?.accountStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(activeConversation.priority)}`}>
                        {getPriorityLabel(activeConversation.priority)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages avec scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(700px - 200px)' }}>
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.messageType === 'user_message' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-md ${
                        message.messageType === 'agent_response' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {getMessageIcon(message.messageType, message.agentId)}
                        <div className={`rounded-lg px-4 py-3 shadow-sm ${
                          message.messageType === 'user_message'
                            ? 'bg-white border border-gray-200 text-gray-900'
                            : message.agentId === 'system'
                            ? 'bg-gray-100 border border-gray-200 text-gray-800'
                            : 'bg-emerald-500 text-white'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`text-xs font-medium ${
                              message.messageType === 'user_message' ? 'text-blue-600' : 
                              message.agentId === 'system' ? 'text-gray-600' : 'text-emerald-100'
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
                            message.agentId === 'system' ? 'text-gray-500' : 'text-emerald-100'
                          }`}>
                            {message.created ? formatTime(message.created) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                {/* Réponses rapides */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {quickReplies.slice(0, 3).map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => setNewMessage(reply)}
                        className="flex-shrink-0 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                      >
                        {reply.length > 30 ? `${reply.substring(0, 30)}...` : reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={sendMessage} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-48 px-3 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Nom de l'agent"
                      />
                    </div>
                    
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre réponse..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
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
                        className="bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
                    </p>
                  </form>
                </div>
              </>
            ) : (
              /* État vide */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Support client {BANK_CONFIG.name}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Sélectionnez une conversation dans la liste pour commencer à aider nos clients.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-gray-700 font-medium">Chat direct</p>
                      <p className="text-gray-500">Réponse immédiate</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-gray-700 font-medium">Téléphone</p>
                      <p className="text-gray-500">+33 1 23 45 67 89</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-gray-700 font-medium">Email</p>
                      <p className="text-gray-500">support@xbank.eu</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonctions utilitaires
function determinePriority(messages: SupportMessage[]): 'low' | 'medium' | 'high' {
  const allContent = messages.map(m => m.content?.toLowerCase() || '').join(' ');
  
  const highPriorityKeywords = [
    'urgent', 'bloqué', 'carte bloquée', 'fraude', 'vol', 'piratage', 
    'compte fermé', 'argent disparu', 'transaction non autorisée', 'aide'
  ];
  
  const mediumPriorityKeywords = [
    'problème', 'erreur', 'bug', 'ne fonctionne pas', 'impossible', 
    'virement échoué', 'carte refusée'
  ];
  
  if (highPriorityKeywords.some(keyword => allContent.includes(keyword))) {
    return 'high';
  }
  
  if (mediumPriorityKeywords.some(keyword => allContent.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

function determineCategory(messages: SupportMessage[]): string {
  const allContent = messages.map(m => m.content?.toLowerCase() || '').join(' ');
  
  if (allContent.includes('carte')) return 'Cartes';
  if (allContent.includes('virement')) return 'Virements';
  if (allContent.includes('épargne')) return 'Épargne';
  if (allContent.includes('investissement')) return 'Investissement';
  if (allContent.includes('sécurité')) return 'Sécurité';
  if (allContent.includes('application')) return 'Technique';
  
  return 'Général';
}

export default AdminSupportSection;