import { pb, User } from '../lib/pocketbase';
import { RegistrationData } from '../types/registration';
import { AccountService } from './accountService';
import { NotificationService } from './notificationService';

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(registrationData: RegistrationData): Promise<User> {
    try {
      // Préparer les données pour PocketBase
      const userData = {
        email: registrationData.credentials.email,
        password: registrationData.credentials.password,
        passwordConfirm: registrationData.credentials.confirmPassword,
        emailVisibility: true,
        verified: false, // L'utilisateur devra vérifier son email
        firstName: registrationData.personalInfo.firstName,
        lastName: registrationData.personalInfo.lastName,
        birthDate: registrationData.personalInfo.dateOfBirth,
        Gender: registrationData.personalInfo.gender,
        nationality: registrationData.personalInfo.nationality,
        street: registrationData.addressInfo.street,
        postalCode: registrationData.addressInfo.postalCode,
        city: registrationData.addressInfo.city,
        country: registrationData.addressInfo.country,
        profession: registrationData.professionalInfo.profession,
        professionalStatus: registrationData.professionalInfo.status,
        monthlyIncomeRange: registrationData.professionalInfo.monthlyIncome,
        accountStatus: 'Pending', // Nouveau compte en attente de validation
        isadmin: false,
        phone: registrationData.personalInfo.phone ? parseInt(registrationData.personalInfo.phone) : undefined
      };

      // Créer l'utilisateur dans PocketBase
      const user = await pb.collection('users').create(userData);

      // Créer automatiquement un compte courant pour le nouvel utilisateur
      try {
        await AccountService.createAccount(user.id, 'Checking');
        
        // Initialiser toutes les données utilisateur (compte, carte, notifications)
        try {
          await UserInitializationService.initializeUserData(user.id);
        } catch (initError) {
          console.error('Erreur lors de l\'initialisation complète:', initError);
          // Continuer même si l'initialisation échoue partiellement
        }
        
        // Créer une notification de bienvenue
        try {
          await NotificationService.createNotification(
            user.id,
            'System',
            `Bienvenue chez ${BANK_CONFIG.name} ! Votre compte a été créé avec succès. Votre compte courant est maintenant disponible.`
          );
        } catch (notificationError) {
          console.warn('Impossible de créer la notification de bienvenue:', notificationError);
        }
      } catch (accountError) {
        console.error('Erreur lors de la création du compte bancaire:', accountError);
        // L'utilisateur est créé mais pas son compte bancaire
        // On pourrait implémenter une logique de retry ou notifier l'admin
      }

      // Envoyer l'email de vérification
      try {
        await pb.collection('users').requestVerification(registrationData.credentials.email);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
        // L'inscription est réussie même si l'email ne part pas
      }

      return user as User;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gestion des erreurs spécifiques
      if (error.data?.email) {
        throw new Error('Cette adresse email est déjà utilisée');
      }
      if (error.data?.password) {
        throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
      }
      
      throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData.record as User;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error('Email ou mot de passe incorrect');
    }
  }

  /**
   * Déconnexion
   */
  static logout(): void {
    pb.authStore.clear();
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated(): boolean {
    return pb.authStore.isValid;
  }

  /**
   * Obtenir l'utilisateur connecté
   */
  static getCurrentUser(): User | null {
    return pb.authStore.model as User | null;
  }

  /**
   * Rafraîchir le token d'authentification
   */
  static async refreshAuth(): Promise<void> {
    try {
      await pb.collection('users').authRefresh();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      this.logout();
    }
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await pb.collection('users').requestPasswordReset(email);
    } catch (error: any) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const updatedUser = await pb.collection('users').update(userId, data);
      return updatedUser as User;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }
}