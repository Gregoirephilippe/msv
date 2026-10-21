import { RegistrationData } from '../types/registration';
import { BANK_CONFIG, CONTACT_INFO } from '../config/constants';

export class ContractService {
  /**
   * Génère un contrat personnalisé à partir des données d'inscription
   */
  static generateContract(registrationData: RegistrationData): string {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    const currentTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const currentYear = new Date().getFullYear();
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Template de contrat avec variables
    const contractTemplate = `# CONTRAT D'OUVERTURE DE COMPTE BANCAIRE
## ${BANK_CONFIG.fullName}

---

### 1. PARTIES CONTRACTANTES

**Établissement bancaire :**
- **Dénomination sociale :** ${BANK_CONFIG.fullName}
- **Forme juridique :** Société Européenne (SE)
- **Siège social :** ${CONTACT_INFO.address}
- **Capital social :** 50 000 000 €
- **RCS :** Paris B 123 456 789
- **Code APE :** 6419Z
- **N° TVA intracommunautaire :** FR12345678901
- **Agrément bancaire :** Établissement de crédit agréé par l'ACPR
- **N° d'agrément :** 12345
- **Code établissement :** 30003
- **Téléphone :** ${CONTACT_INFO.phone}
- **Email :** ${CONTACT_INFO.email}
- **Site web :** www.xbank.eu

**Le Client :**
- **Nom et prénom :** ${registrationData.personalInfo.lastName} ${registrationData.personalInfo.firstName}
- **Date de naissance :** ${new Date(registrationData.personalInfo.dateOfBirth).toLocaleDateString('fr-FR')}
- **Nationalité :** ${this.formatNationality(registrationData.personalInfo.nationality)}
- **Sexe :** ${this.formatGender(registrationData.personalInfo.gender)}
- **Adresse complète :** ${registrationData.addressInfo.street}, ${registrationData.addressInfo.postalCode} ${registrationData.addressInfo.city}, ${this.formatCountry(registrationData.addressInfo.country)}
- **Téléphone :** ${registrationData.personalInfo.phone || 'Non renseigné'}
- **Email :** ${registrationData.credentials.email}
- **Profession :** ${registrationData.professionalInfo.profession}
- **Statut professionnel :** ${this.formatProfessionalStatus(registrationData.professionalInfo.status)}
- **Revenus mensuels :** ${this.formatIncome(registrationData.professionalInfo.monthlyIncome)}

---

### 2. OBJET DU CONTRAT

La présente convention a pour objet l'ouverture et le fonctionnement d'un compte de dépôt ${BANK_CONFIG.name}, assorti des services bancaires associés, conformément à la réglementation européenne et française applicable.

**Date d'ouverture :** ${currentDate}
**Numéro de compte :** [Généré automatiquement]
**IBAN :** [Attribué lors de l'activation]

---

### 3. SERVICES INCLUS

Le compte ${BANK_CONFIG.name} Essentiel comprend les services suivants :

#### 3.1 Services de base
- Attribution d'un IBAN français individuel
- Carte de paiement virtuelle gratuite
- Virements SEPA gratuits et illimités
- Prélèvements automatiques
- 5 retraits DAB gratuits par mois en France
- Consultation de solde en temps réel

#### 3.2 Services numériques
- Application mobile iOS et Android
- Espace client web sécurisé
- Notifications push en temps réel
- Catégorisation automatique des dépenses
- Export des relevés PDF
- Chat support intégré

#### 3.3 Services additionnels
- Paiements sans frais à l'étranger
- Taux de change préférentiels
- Épargne Turbo X avec taux ajusté BCE
- Objectifs d'épargne personnalisés
- Investissement (actions, ETF, crypto)

---

### 4. CONDITIONS D'OUVERTURE ET DE FONCTIONNEMENT

#### 4.1 Conditions d'éligibilité
- Être une personne physique majeure (18 ans révolus)
- Résider dans l'Union Européenne
- Disposer d'une adresse email valide
- Fournir les justificatifs d'identité et de domicile requis

#### 4.2 Vérification d'identité
Le Client s'engage à fournir :
- Pièce d'identité en cours de validité (CNI, passeport)
- Justificatif de domicile de moins de 3 mois
- Selfie vidéo pour vérification biométrique
- Déclaration sur l'honneur de l'exactitude des informations

#### 4.3 Activation du compte
- Vérification des documents sous 24-48h
- Activation automatique après validation
- Attribution de l'IBAN et des moyens de paiement
- Email de confirmation d'ouverture

---

### 5. MOYENS DE PAIEMENT

#### 5.1 Carte virtuelle
- Activation immédiate à l'ouverture
- Paiements en ligne sécurisés (3D Secure)
- Compatible Apple Pay, Google Pay, Samsung Pay
- Blocage/déblocage instantané via l'app

#### 5.2 Carte physique (optionnelle)
- Commande via l'application (50€)
- Livraison sous 5-7 jours ouvrés
- Carte Visa sans contact
- Plafonds personnalisables

#### 5.3 Plafonds par défaut
- Paiements : 3 000€/mois
- Retraits : 500€/semaine
- Virements : 10 000€/mois
- Modifiables via l'espace client

---

### 6. CONDITIONS TARIFAIRES

#### 6.1 Compte Essentiel (Gratuit)
- Tenue de compte : **0€/mois**
- Carte virtuelle : **Gratuite**
- Virements SEPA : **Gratuits**
- 5 retraits DAB/mois : **Gratuits**
- Au-delà : 2€/retrait

#### 6.2 Services optionnels
- Carte physique : 50€ (commande)
- Virements internationaux : 5-15€ selon destination
- Découvert autorisé : Sur demande (taux variable)
- Assurance moyens de paiement : 3€/mois

#### 6.3 Frais incidents
- Rejet de prélèvement : 8€
- Opposition carte : 15€
- Lettre de relance : 5€
- Commission d'intervention : 8€ (max 80€/mois)

---

### 7. ÉPARGNE ET INVESTISSEMENT

#### 7.1 Épargne Turbo X
- Taux d'intérêt : 4,2% APY (ajusté BCE)
- Disponibilité immédiate
- Garantie jusqu'à 100 000€ (FGDR)
- Capitalisation mensuelle

#### 7.2 Investissement
- Actions européennes et américaines
- ETF diversifiés
- Cryptomonnaies (Bitcoin, Ethereum)
- Frais de courtage : 0€
- Compte-titres européen

---

### 8. PROTECTION ET SÉCURITÉ

#### 8.1 Garantie des dépôts
- Protection FGDR jusqu'à 100 000€ par déposant
- Fonds clients ségrégés
- Établissement agréé ACPR

#### 8.2 Sécurité des transactions
- Chiffrement SSL/TLS
- Authentification forte (2FA)
- Biométrie mobile
- Surveillance 24h/24 des fraudes

#### 8.3 Assurance
- Responsabilité civile professionnelle
- Assurance cyber-risques
- Protection juridique incluse

---

### 9. DONNÉES PERSONNELLES ET CONFIDENTIALITÉ

#### 9.1 Traitement des données
Conformément au RGPD, ${BANK_CONFIG.fullName} s'engage à :
- Traiter les données uniquement pour les finalités bancaires
- Respecter les droits d'accès, rectification, suppression
- Conserver les données selon les obligations légales
- Ne pas céder les données à des tiers sans consentement

#### 9.2 Droits du Client
- Droit d'accès aux données personnelles
- Droit de rectification et de suppression
- Droit à la portabilité des données
- Droit d'opposition au traitement
- Contact DPO : dpo@xbank.eu

---

### 10. LUTTE CONTRE LE BLANCHIMENT

#### 10.1 Obligations légales
${BANK_CONFIG.fullName} applique les dispositions relatives à :
- La lutte contre le blanchiment de capitaux
- Le financement du terrorisme
- Les sanctions internationales
- La déclaration TRACFIN si nécessaire

#### 10.2 Vigilance renforcée
- Surveillance des transactions suspectes
- Déclaration obligatoire des opérations atypiques
- Gel des avoirs si nécessaire
- Coopération avec les autorités

---

### 11. RÉCLAMATIONS ET MÉDIATION

#### 11.1 Service réclamations
- Email : reclamations@xbank.eu
- Téléphone : ${CONTACT_INFO.phone}
- Délai de réponse : 15 jours ouvrés
- Accusé de réception sous 48h

#### 11.2 Médiation bancaire
En cas de litige persistant :
- Médiateur bancaire : Médiateur de l'AMF
- Saisine gratuite après épuisement des recours internes
- Procédure en ligne sur le site de l'AMF

---

### 12. RÉSILIATION ET CLÔTURE

#### 12.1 Résiliation par le Client
- Demande via l'espace client ou courrier
- Préavis : Immédiat
- Solde créditeur : Virement sur compte désigné
- Restitution des moyens de paiement

#### 12.2 Résiliation par la Banque
- Préavis de 60 jours (courrier recommandé)
- Motifs légitimes : non-respect du contrat, inactivité
- Résiliation immédiate : fraude, fausse déclaration
- Solde créditeur restitué selon modalités légales

---

### 13. DROIT APPLICABLE ET JURIDICTIONS

#### 13.1 Droit applicable
Le présent contrat est régi par le droit français et les réglementations européennes applicables aux établissements de crédit.

#### 13.2 Juridictions compétentes
- Tribunal judiciaire du siège social de ${BANK_CONFIG.fullName}
- Tribunal du domicile du Client (option du Client)
- Cour d'appel de Paris

---

### 14. ACCEPTATION ET SIGNATURE

#### 14.1 Acceptation électronique
Le Client déclare :
- Avoir pris connaissance de l'intégralité du présent contrat
- Accepter sans réserve les conditions générales
- Certifier l'exactitude des informations fournies
- Consentir au traitement de ses données personnelles

#### 14.2 Signature électronique
**Date de signature :** ${currentDate}
**Heure de signature :** ${currentTime}
**Référence contrat :** XB-${registrationData.personalInfo.lastName.toUpperCase()}-${currentYear}-${randomId}

**Signature électronique du Client :**
${registrationData.credentials.email} - Accepté le ${currentDate} à ${currentTime}

**Pour ${BANK_CONFIG.fullName} :**
Système automatisé d'ouverture de compte
Contrat généré automatiquement et validé par les systèmes de conformité

---

### ANNEXES

#### Annexe A : Grille tarifaire complète
[Disponible sur www.xbank.eu/tarifs]

#### Annexe B : Conditions générales d'utilisation
[Disponible sur www.xbank.eu/cgu]

#### Annexe C : Politique de confidentialité
[Disponible sur www.xbank.eu/confidentialite]

---

**Document généré automatiquement le ${currentDate} à ${currentTime}**
**Référence contrat :** XB-${registrationData.personalInfo.lastName.toUpperCase()}-${currentYear}-${randomId}
**Version :** 2024.1`;

    return contractTemplate;
  }

  /**
   * Génère un contrat et le retourne en format téléchargeable
   */
  static generateContractFile(registrationData: RegistrationData): { content: string; filename: string } {
    const contract = this.generateContract(registrationData);
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Contrat_${BANK_CONFIG.name}_${registrationData.personalInfo.lastName}_${currentDate}.md`;
    
    return {
      content: contract,
      filename
    };
  }

  /**
   * Formate la nationalité
   */
  private static formatNationality(nationality: string): string {
    const nationalityMap: { [key: string]: string } = {
      'FR': 'Française',
      'BE': 'Belge',
      'CH': 'Suisse',
      'DE': 'Allemande',
      'ES': 'Espagnole',
      'IT': 'Italienne',
      'Other': 'Autre'
    };
    return nationalityMap[nationality] || nationality;
  }

  /**
   * Formate le genre
   */
  private static formatGender(gender?: string): string {
    switch (gender) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      case 'Other': return 'Autre';
      default: return 'Non spécifié';
    }
  }

  /**
   * Formate le pays
   */
  private static formatCountry(country: string): string {
    const countryMap: { [key: string]: string } = {
      'FR': 'France',
      'BE': 'Belgique',
      'CH': 'Suisse',
      'DE': 'Allemagne',
      'ES': 'Espagne',
      'IT': 'Italie'
    };
    return countryMap[country] || country;
  }

  /**
   * Formate le statut professionnel
   */
  private static formatProfessionalStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'student': 'Étudiant',
      'employee': 'Salarié',
      'self-employed': 'Indépendant',
      'unemployed': 'Sans emploi',
      'retired': 'Retraité',
      'other': 'Autre'
    };
    return statusMap[status] || status;
  }

  /**
   * Formate la tranche de revenus
   */
  private static formatIncome(income: string): string {
    const incomeMap: { [key: string]: string } = {
      '0-1000': 'Moins de 1 000€',
      '1000-2000': '1 000€ - 2 000€',
      '2000-3000': '2 000€ - 3 000€',
      '3000-5000': '3 000€ - 5 000€',
      '5000-8000': '5 000€ - 8 000€',
      '8000+': 'Plus de 8 000€'
    };
    return incomeMap[income] || income;
  }

  /**
   * Télécharge le contrat en tant que fichier
   */
  static downloadContract(registrationData: RegistrationData): void {
    const { content, filename } = this.generateContractFile(registrationData);
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Prévisualise le contrat dans une nouvelle fenêtre
   */
  static previewContract(registrationData: RegistrationData): void {
    const contract = this.generateContract(registrationData);
    
    // Convertir le markdown en HTML basique pour l'affichage
    const htmlContent = this.markdownToHtml(contract);
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aperçu du contrat ${BANK_CONFIG.name}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 { color: #059669; }
            h1 { border-bottom: 2px solid #059669; padding-bottom: 10px; }
            h3 { margin-top: 30px; }
            h4 { color: #374151; margin-top: 20px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            strong { color: #1f2937; }
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
            .signature-section { 
              background: #f9fafb; 
              padding: 20px; 
              border-radius: 8px; 
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="signature-section">
            <p><strong>Note :</strong> Ceci est un aperçu du contrat. Le contrat final sera généré lors de la validation de votre inscription.</p>
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  /**
   * Convertit le markdown en HTML basique
   */
  private static markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/li><\/p>/g, '</li></ul>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
      .replace(/<p><hr><\/p>/g, '<hr>')
      .replace(/<p><\/p>/g, '');
  }
}