import { pb } from '../lib/pocketbase';

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  iban: string;
  bic?: string;
  bankName?: string;
  category: 'family' | 'friend' | 'business' | 'service' | 'other';
  isFavorite: boolean;
  notes?: string;
  created?: string;
  updated?: string;
}

export class BeneficiaryService {
  /**
   * Créer un nouveau bénéficiaire
   */
  static async createBeneficiary(
    userId: string,
    name: string,
    iban: string,
    bic?: string,
    bankName?: string,
    category: Beneficiary['category'] = 'other',
    isFavorite: boolean = false,
    notes?: string
  ): Promise<Beneficiary> {
    try {
      const beneficiaryData = {
        userId,
        name: name.trim(),
        iban: iban.replace(/\s/g, '').toUpperCase(), // Nettoyer l'IBAN
        bic: bic?.trim(),
        bankName: bankName?.trim(),
        category,
        isFavorite,
        notes: notes?.trim()
      };

      const beneficiary = await pb.collection('Beneficiaries').create(beneficiaryData);
      return beneficiary as Beneficiary;
    } catch (error: any) {
      console.error('Erreur lors de la création du bénéficiaire:', error);
      throw new Error('Erreur lors de la création du bénéficiaire');
    }
  }

  /**
   * Obtenir tous les bénéficiaires d'un utilisateur
   */
  static async getUserBeneficiaries(userId: string): Promise<Beneficiary[]> {
    try {
      const result = await pb.collection('Beneficiaries').getList(1, 500, {
        filter: `userId = "${userId}"`,
        sort: '-isFavorite,-created'
      });
      return result.items as Beneficiary[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des bénéficiaires:', error);
      throw new Error('Erreur lors de la récupération des bénéficiaires');
    }
  }

  /**
   * Rechercher un bénéficiaire par IBAN
   */
  static async findBeneficiaryByIban(userId: string, iban: string): Promise<Beneficiary | null> {
    try {
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      const result = await pb.collection('Beneficiaries').getList(1, 1, {
        filter: `userId = "${userId}" && iban = "${cleanIban}"`
      });
      
      return result.items.length > 0 ? result.items[0] as Beneficiary : null;
    } catch (error: any) {
      console.error('Erreur lors de la recherche du bénéficiaire:', error);
      return null;
    }
  }

  /**
   * Créer automatiquement un bénéficiaire lors d'un virement
   */
  static async createBeneficiaryFromTransfer(
    userId: string,
    name: string,
    iban: string,
    bankName?: string
  ): Promise<Beneficiary> {
    try {
      // Vérifier si le bénéficiaire existe déjà
      const existing = await this.findBeneficiaryByIban(userId, iban);
      if (existing) {
        return existing;
      }

      // Créer le nouveau bénéficiaire
      return await this.createBeneficiary(
        userId,
        name,
        iban,
        undefined, // BIC optionnel
        bankName,
        'other', // Catégorie par défaut
        false, // Pas favori par défaut
        'Créé automatiquement lors d\'un virement'
      );
    } catch (error: any) {
      console.error('Erreur lors de la création automatique du bénéficiaire:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un bénéficiaire
   */
  static async updateBeneficiary(
    beneficiaryId: string,
    updates: Partial<Omit<Beneficiary, 'id' | 'userId' | 'created' | 'updated'>>
  ): Promise<Beneficiary> {
    try {
      const beneficiary = await pb.collection('Beneficiaries').update(beneficiaryId, updates);
      return beneficiary as Beneficiary;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du bénéficiaire:', error);
      throw new Error('Erreur lors de la mise à jour du bénéficiaire');
    }
  }

  /**
   * Supprimer un bénéficiaire
   */
  static async deleteBeneficiary(beneficiaryId: string): Promise<void> {
    try {
      await pb.collection('Beneficiaries').delete(beneficiaryId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error);
      throw new Error('Erreur lors de la suppression du bénéficiaire');
    }
  }

  /**
   * Marquer/Démarquer un bénéficiaire comme favori
   */
  static async toggleFavorite(beneficiaryId: string, isFavorite: boolean): Promise<Beneficiary> {
    try {
      return await this.updateBeneficiary(beneficiaryId, { isFavorite });
    } catch (error: any) {
      console.error('Erreur lors du changement de favori:', error);
      throw new Error('Erreur lors du changement de favori');
    }
  }

  /**
   * Valider un IBAN (validation basique)
   */
  static validateIban(iban: string): boolean {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Vérification basique de la longueur et du format
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      return false;
    }
    
    // Vérification que ça commence par 2 lettres
    if (!/^[A-Z]{2}/.test(cleanIban)) {
      return false;
    }
    
    // Vérification que le reste contient des chiffres et lettres
    if (!/^[A-Z]{2}[0-9A-Z]+$/.test(cleanIban)) {
      return false;
    }
    
    return true;
  }

  /**
   * Formater un IBAN pour l'affichage
   */
  static formatIban(iban: string): string {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    return cleanIban.replace(/(.{4})/g, '$1 ').trim();
  }
}