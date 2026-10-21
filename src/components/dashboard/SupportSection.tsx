import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  User,
  Bot,
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { SupportChatService, SupportMessage } from '../../services/supportChatService';
import { BANK_CONFIG, CONTACT_INFO } from '../../config/constants';

interface SupportSectionProps {
  user: any;
}

const SupportSection: React.FC<SupportSectionProps> = ({ user }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userMessages = await SupportChatService.getUserMessages(user.id);
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
      // Envoyer le message utilisateur
      await SupportChatService.sendUserMessage(
        user.id,
        messageContent,
        `${user.firstName} ${user.lastName}`
      );

      // Recharger les messages
      await loadMessages();
      
      // Simuler la frappe de l'agent
      setIsTyping(true);
      
      // Simuler une réponse automatique après un délai
      setTimeout(async () => {
        try {
          await SupportChatService.simulateAgentResponse(user.id);
          await loadMessages();
        } catch (error) {
          console.error('Erreur lors de l\'envoi du message automatique:', error);
        } finally {
          setIsTyping(false);
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
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

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hier ' + date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessageIcon = (messageType: string, agentId?: string) => {
    if (messageType === 'user_message') {
      return (
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-emerald-600" />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-gray-600" />
        </div>
      );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadMessages}
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
          <h2 className="text-2xl font-bold text-gray-900">Support client</h2>
          <p className="text-gray-600">Nous sommes là pour vous aider 24h/24, 7j/7</p>
        </div>
      </div>

      {/* Interface de chat simplifiée */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="h-[600px] flex flex-col">
          {/* Header du chat */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Support {BANK_CONFIG.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">En ligne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-gray-600">Chargement des messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bienvenue au support {BANK_CONFIG.name}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Notre équipe est là pour répondre à toutes vos questions concernant vos comptes, cartes et services.
                </p>
                <p className="text-sm text-gray-500">
                  Tapez votre message ci-dessous pour commencer
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.messageType === 'user_message' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                      message.messageType === 'user_message' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {getMessageIcon(message.messageType, message.agentId)}
                      <div className={`rounded-lg px-4 py-2 ${
                        message.messageType === 'user_message'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.messageType === 'user_message' ? 'text-emerald-100' : 'text-gray-500'
                        }`}>
                          {message.created ? formatTime(message.created) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Indicateur de frappe */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={1}
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
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>
      </div>

      {/* Contacts rapides */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chat en direct</h3>
              <p className="text-sm text-gray-600">Réponse immédiate</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Discutez avec notre équipe support en temps réel
          </p>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">En ligne</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Téléphone</h3>
              <p className="text-sm text-gray-600">{CONTACT_INFO.phone}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Lun-Ven 8h-20h, Sam 9h-17h
          </p>
          <button className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Appeler maintenant
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">{CONTACT_INFO.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Réponse sous 24h
          </p>
          <button className="w-full bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition-colors">
            Envoyer un email
          </button>
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions fréquentes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              question: "Comment commander une nouvelle carte ?",
              answer: "Rendez-vous dans 'Mes cartes' et cliquez sur 'Nouvelle carte'. Frais de 50€, livraison sous 5-7 jours."
            },
            {
              question: "Quels sont les frais de virement ?",
              answer: "Les virements SEPA sont gratuits. Les virements internationaux ont des frais variables selon la destination."
            },
            {
              question: "Comment augmenter mes plafonds ?",
              answer: "Contactez-nous via le chat ou modifiez vos plafonds dans les paramètres de votre carte."
            },
            {
              question: "Que faire en cas de carte perdue ?",
              answer: "Bloquez immédiatement votre carte dans l'app, puis contactez-nous pour commander une nouvelle carte."
            }
          ].map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
