import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserDetailsProps {
  user: any;
  isEditing: boolean;
  editForm: any;
  onEditToggle: () => void;
  onEditChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  isEditing,
  editForm,
  onEditToggle,
  onEditChange,
  onSave,
  onCancel,
  isSaving
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Suspended': return <AlertTriangle className="h-4 w-4" />;
      case 'Closed': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Modifier l'utilisateur</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                value={editForm.firstName || ''}
                onChange={(e) => onEditChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={editForm.lastName || ''}
                onChange={(e) => onEditChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editForm.email || ''}
              onChange={(e) => onEditChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isSaving}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => onEditChange('phone', parseInt(e.target.value) || '')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut du compte</label>
              <select
                value={editForm.accountStatus || ''}
                onChange={(e) => onEditChange('accountStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isSaving}
              >
                <option value="Pending">En attente</option>
                <option value="Active">Actif</option>
                <option value="Suspended">Suspendu</option>
                <option value="Closed">Fermé</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Informations utilisateur</h3>
        <button
          onClick={onEditToggle}
          className="text-red-600 hover:text-red-700 transition-colors flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Modifier</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user.verified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Non vérifié
                  </span>
                )}
              </div>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Date de naissance</p>
              <p className="font-medium text-gray-900">
                {user.birthDate ? formatDate(user.birthDate) : 'Non renseignée'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium text-gray-900">
                {user.street && user.city ? (
                  <>
                    {user.street}<br />
                    {user.postalCode} {user.city}<br />
                    {user.country}
                  </>
                ) : (
                  'Non renseignée'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Profession</p>
              <p className="font-medium text-gray-900">
                {user.profession || 'Non renseignée'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Statut du compte</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus || 'Pending')}`}>
                {getStatusIcon(user.accountStatus || 'Pending')}
                <span className="ml-1">{user.accountStatus || 'Pending'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Inscription</p>
              <p className="font-medium text-gray-900">
                {user.created ? formatDate(user.created) : 'Date inconnue'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;