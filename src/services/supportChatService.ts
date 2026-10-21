import { pb } from '../lib/pocketbase';

import { BANK_CONFIG } from '../config/constants';
import { BANK_CONFIG } from '../config/constants';

export interface SupportMessage {
  id: string;
  userId: string;
  conversationId: string;
  messageType: 'user_message' | 'agent_response';
  content: string;
  authorName: string;
  agentId?: string;
  isRead: boolean;
  created?: string;
  updated?: string;
}

export class SupportChatService {
  /**
   * Envoyer un message utilisateur
   */
  static async sendUserMessage(
    userId: string,
    message: string,
    authorName: string
  ): Promise<SupportMessage> {
    try {
      // Utiliser un conversationId simple basé sur l'userId
      const conversationId = `conv_${userId}`;
      
      const messageData = {
        userId,
        conversationId,
        messageType: 'user_message',
        content: message.trim(),
        authorName: authorName.trim(),
        isRead: false
      };

      const record = await pb.collection('SupportChat').create(messageData);
      return record as SupportMessage;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error('Erreur lors de l\'envoi du message');
    }
  }

  /**
   * Obtenir tous les messages d'un utilisateur
   */
  static async getUserMessages(userId: string): Promise<SupportMessage[]> {
    try {
      const conversationId = `conv_${userId}`;
      
      const result = await pb.collection('SupportChat').getList(1, 500, {
        filter: `userId = "${userId}" && conversationId = "${conversationId}"`,
        sort: 'created'
      });

      return result.items as SupportMessage[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw new Error('Erreur lors de la récupération des messages');
    }
  }

  /**
   * Envoyer un message automatique indiquant qu'un agent va répondre
   */
  static async simulateAgentResponse(
    userId: string,
    userMessage?: string
  ): Promise<SupportMessage> {
    try {
      const conversationId = `conv_${userId}`;
      
      // Message standard indiquant qu'un agent va répondre
      const response = `Merci pour votre message. Un agent du support ${BANK_CONFIG.name} va vous répondre dans les plus brefs délais.`;
      
      const messageData = {
        userId,
        conversationId,
        messageType: 'agent_response',
        content: response,
        authorName: `Support ${BANK_CONFIG.name}`,
        agentId: 'system',
        isRead: false
      };

      const record = await pb.collection('SupportChat').create(messageData);
      return record as SupportMessage;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message automatique:', error);
      throw new Error('Erreur lors de l\'envoi du message automatique');
    }
  }

  /**
   * Envoyer un message depuis l'interface admin
   */
  static async sendAdminMessage(
    userId: string,
    message: string,
    agentName: string,
    agentId: string
  ): Promise<SupportMessage> {
    try {
      const conversationId = `conv_${userId}`;
      
      const messageData = {
        userId,
        conversationId,
        messageType: 'agent_response',
        content: message.trim(),
        authorName: agentName.trim(),
        agentId,
        isRead: false
      };

      const record = await pb.collection('SupportChat').create(messageData);
      return record as SupportMessage;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message admin:', error);
      throw new Error('Erreur lors de l\'envoi du message admin');
    }
  }

  /**
   * Marquer une conversation comme lue
   */
  static async markConversationAsRead(userId: string, conversationId: string): Promise<void> {
    try {
      // Marquer tous les messages non lus de cette conversation comme lus
      const unreadMessages = await pb.collection('SupportChat').getList(1, 500, {
        filter: `userId = "${userId}" && conversationId = "${conversationId}" && isRead = false`
      });

      const promises = unreadMessages.items.map(message =>
        pb.collection('SupportChat').update(message.id, { isRead: true })
      );

      await Promise.all(promises);
    } catch (error: any) {
      console.error('Erreur lors du marquage de la conversation:', error);
      throw new Error('Erreur lors du marquage de la conversation');
    }
  }
}