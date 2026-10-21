import { pb, Notification } from '../lib/pocketbase';

export class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  static async createNotification(
    userId: string,
    type: 'Transaction' | 'Security' | 'Marketing' | 'System' | 'Alert',
    message: string,
    link?: string
  ): Promise<Notification> {
    try {
      const notification = await pb.collection('Notifications').create({
        userId,
        type,
        message,
        link,
        isRead: false
      });
      return notification as Notification;
    } catch (error: any) {
      console.error('Erreur lors de la création de la notification:', error);
      throw new Error('Erreur lors de la création de la notification');
    }
  }

  /**
   * Obtenir toutes les notifications d'un utilisateur
   */
  static async getUserNotifications(userId: string, limit?: number): Promise<Notification[]> {
    try {
      const options: any = {
        filter: `userId = "${userId}"`,
        sort: '-created'
      };

      if (limit) {
        const result = await pb.collection('Notifications').getList(1, limit, options);
        return result.items as Notification[];
      } else {
        const result = await pb.collection('Notifications').getList(1, 500, options);
        return result.items as Notification[];
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw new Error('Erreur lors de la récupération des notifications');
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await pb.collection('Notifications').update(notificationId, {
        isRead: true
      });
      return notification as Notification;
    } catch (error: any) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw new Error('Erreur lors du marquage de la notification');
    }
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      // Récupérer toutes les notifications non lues
      const unreadResult = await pb.collection('Notifications').getList(1, 500, {
        filter: `userId = "${userId}" && isRead = false`
      });

      // Marquer chacune comme lue
      const promises = unreadResult.items.map(notification =>
        pb.collection('Notifications').update(notification.id, { isRead: true })
      );

      await Promise.all(promises);
    } catch (error: any) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw new Error('Erreur lors du marquage des notifications');
    }
  }

  /**
   * Supprimer une notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await pb.collection('Notifications').delete(notificationId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw new Error('Erreur lors de la suppression de la notification');
    }
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await pb.collection('Notifications').getList(1, 1, {
        filter: `userId = "${userId}" && isRead = false`
      });
      return result.totalItems;
    } catch (error: any) {
      console.error('Erreur lors du comptage des notifications:', error);
      return 0;
    }
  }
}