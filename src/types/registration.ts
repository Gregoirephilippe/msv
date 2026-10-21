export interface PersonalInfo {
  firstName: string;
  lastName: string;
  gender?: 'M' | 'F' | 'Other';
  dateOfBirth: string;
  nationality: string;
  phone?: string;
}

export interface AddressInfo {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface ProfessionalInfo {
  profession: string;
  status: 'student' | 'employee' | 'self-employed' | 'unemployed' | 'retired' | 'other';
  monthlyIncome: string;
}

export interface AccountCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationData {
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  professionalInfo: ProfessionalInfo;
  credentials: AccountCredentials;
  acceptedTerms: boolean;
  certifiedAccuracy: boolean;
}

export type RegistrationStep = 'personal' | 'address' | 'professional' | 'credentials' | 'summary';