import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  isAddingRole = false;
  activeTab = 'account'; // 'account', 'reservations', 'notifications', 'settings'
  
  // Edit mode
  isEditing = false;
  editUser: any = {};

  // Photo upload
  photoPreview: string | null = null;
  photoUploading = false;
  photoSuccess = false;
  // Password Change
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  passwordStrength = 0;

  // Danger Zone
  showDeleteModal = false;
  deleteConfirmText = '';

  // Available roles for switcher
  availableRoles: any[] = [];
  activeRole: string | null = null;

  // Realistic Stats Mock
  userStats = {
    totalRides: 42,
    rewardsPoints: 1250,
    securityScore: 85,
    missingDocs: 2
  };

  // Activities Mock
  recentActivities = [
    { type: 'login', text: 'Connexion réussie', detail: 'Windows • Tunis, TN', date: 'Aujourd\'hui à 14:22', icon: 'ion-ios-unlock', color: '#22c55e', bg: '#f0fdf4' },
    { type: 'edit', text: 'Profil modifié', detail: 'Informations personnelles mises à jour', date: 'Il y a 2 jours', icon: 'ion-ios-create', color: '#3b82f6', bg: '#eff6ff' },
    { type: 'role', text: 'Nouveau rôle Chauffeur activé', detail: 'Accès complet à la plateforme chauffeur', date: 'Il y a 3 jours', icon: 'ion-ios-people', color: '#8b5cf6', bg: '#f5f3ff' },
    { type: 'phone', text: 'Téléphone vérifié', detail: 'Code de sécurité validé par SMS', date: 'Il y a 5 jours', icon: 'ion-ios-call', color: '#22c55e', bg: '#f0fdf4' }
  ];

  // Security Sessions Mock
  activeSessions = [
    { device: 'MacBook Pro', browser: 'Chrome on macOS', location: 'Tunis, Tunisie', status: 'Session actuelle', icon: 'ion-md-desktop', isCurrent: true },
    { device: 'iPhone 13', browser: 'GoRide App on iOS', location: 'Sousse, Tunisie', status: 'Actif il y a 2h', icon: 'ion-md-phone-portrait', isCurrent: false },
    { device: 'PC Windows', browser: 'Edge on Windows 11', location: 'Tunis, Tunisie', status: 'Actif hier', icon: 'ion-md-laptop', isCurrent: false }
  ];

  loginHistory = [
    { date: '02 Mai 2026, 14:22', status: 'Succès', ip: '197.2.16.42', location: 'Tunis, TN', icon: 'ion-ios-checkmark-circle', color: '#10b981' },
    { date: '01 Mai 2026, 09:15', status: 'Succès', ip: '197.2.16.42', location: 'Tunis, TN', icon: 'ion-ios-checkmark-circle', color: '#10b981' },
    { date: '30 Avril 2026, 22:40', status: 'Échec', ip: '41.226.11.5', location: 'Moscou, RU', icon: 'ion-ios-alert', color: '#ef4444' }
  ];

  // Full Activities Mock
  activityFilter = 'all';
  allActivities = [
    { id: 1, type: 'booking', text: 'Réservation de trajet effectuée', date: 'Aujourd\'hui, 15:45', details: 'Tunis → Hammamet', icon: 'ion-ios-car', color: '#2563eb', bg: '#eff6ff', meta: '45.000 DT' },
    { id: 2, type: 'login', text: 'Connexion depuis un nouvel appareil', date: 'Aujourd\'hui, 14:22', details: 'Chrome sur MacBook Pro', icon: 'ion-ios-unlock', color: '#10b981', bg: '#ecfdf5', meta: 'Tunis, TN' },
    { id: 3, type: 'edit', text: 'Mise à jour des informations de contact', date: 'Hier, 10:30', details: 'Changement de numéro de téléphone', icon: 'ion-ios-create', color: '#f59e0b', bg: '#fffbeb', meta: 'Profil' },
    { id: 4, type: 'payment', text: 'Paiement reçu - Course #842', date: '01 Mai 2026', details: 'Portefeuille GoRide', icon: 'ion-ios-wallet', color: '#8b5cf6', bg: '#f5f3ff', meta: '+25.500 DT' },
    { id: 5, type: 'booking', text: 'Trajet terminé avec succès', date: '30 Avril 2026', details: 'Sousse → Monastir', icon: 'ion-ios-checkmark-circle', color: '#10b981', bg: '#ecfdf5', meta: 'Évalué 5/5' },
    { id: 6, type: 'security', text: 'Mot de passe modifié', date: '28 Avril 2026', details: 'Action sécurisée', icon: 'ion-ios-key', color: '#ef4444', bg: '#fef2f2', meta: 'Sécurité' }
  ];

  getFilteredActivities() {
    if (this.activityFilter === 'all') return this.allActivities;
    return this.allActivities.filter(a => a.type === this.activityFilter);
  }

  // Payments Mock
  walletBalance = 125.500;
  savedCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', holder: 'Ichraf Ouhichi', isDefault: true, icon: 'ion-logo-visa', color: '#1a1f71' },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '05/25', holder: 'Ichraf Ouhichi', isDefault: false, icon: 'ion-logo-mastercard', color: '#eb001b' }
  ];

  paymentHistory = [
    { id: '#GR-8542', date: '02 Mai 2026', method: 'Visa •••• 4242', amount: '45.000', status: 'Payé', type: 'Course', icon: 'ion-ios-car' },
    { id: '#GR-8421', date: '01 Mai 2026', method: 'Portefeuille', amount: '12.500', status: 'Payé', type: 'Frais service', icon: 'ion-ios-options' },
    { id: '#GR-8310', date: '28 Avril 2026', method: 'Visa •••• 4242', amount: '35.000', status: 'Remboursé', type: 'Course annulée', icon: 'ion-ios-undo' }
  ];

  // Documents Mock
  userDocuments = [
    { id: 1, name: 'Carte d\'Identité Nationale', type: 'CIN', status: 'verified', date: 'Vérifié le 15/01/2026', icon: 'ion-ios-card', color: '#10b981' },
    { id: 2, name: 'Permis de Conduire', type: 'LICENSE', status: 'pending', date: 'En attente de revue', icon: 'ion-ios-list', color: '#f59e0b' },
    { id: 3, name: 'Assurance Véhicule', type: 'INSURANCE', status: 'rejected', date: 'Expire le 12/04/2026', icon: 'ion-ios-shield', color: '#ef4444', reason: 'Document illisible ou expiré.' },
    { id: 4, name: 'Carte Grise', type: 'VEHICLE_PAPERS', status: 'missing', date: 'Non soumis', icon: 'ion-ios-car', color: '#94a3b8' },
    { id: 5, name: 'Photo de Profil Officielle', type: 'PROFILE_PHOTO', status: 'verified', date: 'Vérifié le 15/01/2026', icon: 'ion-ios-contact', color: '#10b981' }
  ];

  upcomingBookings = [
    { id: '#BK-9521', type: 'Course Uber', date: 'Demain, 08:30', from: 'Tunis Aéroport', to: 'Carthage', status: 'confirmé', icon: 'ion-ios-airplane', color: '#3b82f6' },
    { id: '#BK-8412', type: 'Location véhicule', date: '05 Mai 2026', from: 'Sousse', to: 'Monastir', status: 'pending', icon: 'ion-ios-car', color: '#f59e0b' }
  ];

  refundRequests = [
    { id: '#RF-221', date: '25 Avril 2026', amount: '15.000', status: 'Traité', reason: 'Trajet annulé par chauffeur' }
  ];

  // Preferences Mock
  userPreferences = {
    theme: 'light',
    language: 'fr',
    notifications: {
      email: true,
      sms: false,
      push: true,
      promotions: false
    },
    privacy: {
      profilePublic: true,
      showActivity: true,
      dataSharing: false
    },
    accessibility: {
      highContrast: false,
      largeText: false
    }
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchTransactions();
    this.fetchActivities();
    this.fetchDocuments();
    this.fetchBookings();
    
    this.activeRole = this.authService.getActiveRole();
    this.setupAvailableRoles();
    
    // Lire l'onglet depuis l'URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
    // Charge la photo locale si elle a été définie
    const localUser = this.authService.getCurrentUser();
    if (localUser?.photoUrl) {
      this.photoPreview = localUser.photoUrl;
    }
  }

  fetchTransactions(): void {
    this.http.get<any[]>('http://localhost:8081/api/users/me/transactions').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.paymentHistory = data.map(t => ({
            id: '#' + t.transactionId,
            date: new Date(t.createdAt).toLocaleDateString('fr-FR'),
            method: t.type === 'RECHARGE' ? 'D17 / Carte' : 'Portefeuille',
            amount: t.amount.toString(),
            status: t.status === 'COMPLETED' ? 'Payé' : t.status,
            type: t.title,
            icon: t.type === 'RECHARGE' ? 'ion-ios-wallet' : 'ion-ios-car'
          }));
        }
      },
      error: (err) => console.error('Erreur transactions:', err)
    });
  }

  fetchActivities(): void {
    this.http.get<any[]>('http://localhost:8081/api/users/me/activities').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allActivities = data.map(a => ({
            id: a.id,
            type: a.type.toLowerCase(),
            text: a.title,
            date: new Date(a.createdAt).toLocaleDateString('fr-FR'),
            details: a.description,
            icon: this.getActivityIcon(a.type),
            color: this.getActivityColor(a.category),
            bg: this.getActivityBg(a.category),
            meta: a.type
          }));
        }
      },
      error: (err) => console.error('Erreur activités:', err)
    });
  }

  private getActivityIcon(type: string): string {
    switch(type) {
      case 'TRIP': return 'ion-ios-car';
      case 'SECURITY': return 'ion-ios-lock';
      case 'PAYMENT': return 'ion-ios-wallet';
      default: return 'ion-ios-information-circle';
    }
  }

  private getActivityColor(category: string): string {
    switch(category) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#3b82f6';
    }
  }

  private getActivityBg(category: string): string {
    switch(category) {
      case 'success': return '#ecfdf5';
      case 'warning': return '#fffbeb';
      case 'danger': return '#fef2f2';
      default: return '#eff6ff';
    }
  }

  fetchDocuments(): void {
    this.http.get<any[]>('http://localhost:8081/api/users/me/documents').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.userDocuments = data.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
            status: d.status,
            date: d.status === 'verified' ? 'Vérifié' : (d.status === 'pending' ? 'En attente' : 'À refaire'),
            icon: this.getDocumentIcon(d.type),
            color: this.getDocumentColor(d.status),
            reason: d.rejectionReason
          }));
        }
      },
      error: (err) => console.error('Erreur documents:', err)
    });
  }

  fetchBookings(): void {
    this.http.get<any[]>('http://localhost:8081/api/users/me/bookings').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.upcomingBookings = data.map(b => ({
            id: '#' + b.id,
            type: 'Trajet GoRide',
            date: b.pickupLocation,
            from: b.pickupLocation,
            to: b.destination,
            status: b.status,
            icon: 'ion-ios-car',
            color: '#3b82f6'
          }));
        }
      },
      error: (err) => console.error('Erreur réservations:', err)
    });
  }

  private getDocumentIcon(type: string): string {
    if (type === 'CIN') return 'ion-ios-card';
    if (type === 'LICENSE') return 'ion-ios-list';
    return 'ion-ios-document';
  }

  private getDocumentColor(status: string): string {
    if (status === 'verified') return '#10b981';
    if (status === 'pending') return '#f59e0b';
    if (status === 'rejected') return '#ef4444';
    return '#94a3b8';
  }

  allAvailableRoles = [
    { id: 'ROLE_USER', label: 'Client (Trajets)', icon: 'ion-ios-navigate', color: '#10b981', description: 'Commander des trajets au quotidien.' },
    { id: 'ROLE_CLIENT', label: 'Client (Location)', icon: 'ion-ios-car', color: '#2563eb', description: 'Louer des véhicules pour vos besoins.' },
    { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-speedometer', color: '#6366f1', description: 'Gagner de l\'argent en conduisant.' },
    { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', color: '#f59e0b', description: 'Gérer votre propre flotte de véhicules.' },
    { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-briefcase', color: '#7c3aed', description: 'Solutions de transport pour entreprises.' }
  ];

  setupAvailableRoles(): void {
    const roles = this.authService.getCurrentUser()?.roles || [];
    this.availableRoles = this.allAvailableRoles.filter(r => roles.includes(r.id));
  }

  hasRole(roleId: string): boolean {
    return this.authService.hasRole(roleId);
  }

  switchRole(roleId: string): void {
    const roleShortName = roleId.replace('ROLE_', '');
    this.authService.setActiveRole(roleShortName);
    this.activeRole = roleId;
    window.location.reload(); // Recharger pour appliquer le nouveau dashboard
  }

  requestNewRole(role: string): void {
    this.authService.addRole(role).subscribe({
      next: (res) => {
        alert(res.message);
        this.fetchProfile(); // Rafraîchir pour voir le nouveau rôle
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de l\'ajout du rôle.')
    });
  }

  deleteRole(role: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle ${role} ?`)) {
      this.authService.removeRole(role).subscribe({
        next: (res) => {
          alert(res.message);
          this.fetchProfile(); // Rafraîchir pour mettre à jour la liste
        },
        error: (err) => alert(err.error?.message || 'Erreur lors de la suppression.')
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editUser = { ...this.user };
    }
  }

  saveProfile(): void {
    this.loading = true;
    // Simulation d'appel API pour la mise à jour
    setTimeout(() => {
      this.user = { ...this.editUser };
      this.authService.updateUser(this.user);
      this.isEditing = false;
      this.loading = false;
      this.successMessage = "Profil mis à jour avec succès !";
      setTimeout(() => this.successMessage = null, 3000);
    }, 1000);
  }

  checkPasswordStrength(event: any) {
    const pwd = event.target.value;
    let strength = 0;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 7 && /[A-Z]/.test(pwd)) strength += 1;
    if (pwd.length > 8 && /[0-9!@#$%^&*]/.test(pwd)) strength += 1;
    this.passwordStrength = strength;
  }

  getStrengthText(): string {
    if (this.passwordStrength === 1) return 'Faible';
    if (this.passwordStrength === 2) return 'Moyen';
    if (this.passwordStrength >= 3) return 'Fort';
    return '';
  }

  getStrengthClass(): string {
    if (this.passwordStrength === 1) return 'weak';
    if (this.passwordStrength === 2) return 'medium';
    if (this.passwordStrength >= 3) return 'strong';
    return '';
  }

  // Danger Zone Actions
  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
  }

  confirmDeleteAccount() {
    if (this.deleteConfirmText === 'SUPPRIMER') {
      console.log('Demande de suppression de compte confirmée !');
      // Logic API here
      this.closeDeleteModal();
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  fetchProfile(): void {
    this.loading = true;
    this.http.get('http://localhost:8081/api/users/me').subscribe({
      next: (data: any) => {
        this.user = data;
        // Sync wallet and loyalty from real data
        if (data.walletBalance !== undefined) this.walletBalance = data.walletBalance;
        if (data.loyaltyPoints !== undefined) this.userStats.rewardsPoints = data.loyaltyPoints;
        
        // Sync preferences
        this.userPreferences.theme = data.theme || 'light';
        this.userPreferences.language = data.language || 'fr';
        this.userPreferences.notifications.email = data.notifEmail;
        this.userPreferences.notifications.sms = data.notifSms;
        this.userPreferences.notifications.push = data.notifPush;

        this.loading = false;
        this.error = null;
        
        // Synchroniser avec le localStorage pour que le reste de l'app (Sidebar, Header) soit à jour
        this.authService.updateUser(this.user);
        this.setupAvailableRoles();
      },
      error: (err) => {
        console.error('Erreur profil:', err);
        const localUser = this.authService.getCurrentUser();
        if (localUser) {
          this.user = localUser;
          this.setupAvailableRoles();
        } else {
          this.error = 'Impossible de charger le profil.';
        }
        this.loading = false;
      }
    });
  }

  getRoleLabel(role: string): string {
    const roles: any = {
      'ROLE_CLIENT': 'Client',
      'ROLE_USER': 'Client',
      'ROLE_DRIVER': 'Chauffeur',
      'ROLE_FLEET_OWNER': 'Propriétaire de Flotte',
      'ROLE_COMPANY': 'Entreprise',
      'ROLE_ADMIN': 'Administrateur'
    };
    return roles[role] || role;
  }



  private updateLocalUserRoles(roleToCheck: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      if (!currentUser.roles.includes(roleToCheck)) {
        currentUser.roles.push(roleToCheck);
      }
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
      
      // Mettre à jour l'objet user du composant pour que les *ngIf réagissent
      if (this.user) {
        if (!this.user.roles) this.user.roles = [];
        // On ajoute le rôle sous forme d'objet ou de string selon le format existant
        const existingRole = this.user.roles.find((r: any) => (r.name === roleToCheck || r === roleToCheck));
        if (!existingRole) {
          this.user.roles.push({ name: roleToCheck });
        }
      }
      
      // Notifier les composants (Header, Sidebar) du changement
      this.authService.setActiveRole(this.authService.getActiveRole()!); 
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez choisir un fichier image valide (JPG, PNG, etc.)';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La photo ne doit pas dépasser 5 Mo.';
      return;
    }

    this.error = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  savePhoto(): void {
    if (!this.photoPreview) return;
    this.photoUploading = true;
    setTimeout(() => {
      this.authService.updateUserPhoto(this.photoPreview!);
      this.photoUploading = false;
      this.photoSuccess = true;
      setTimeout(() => this.photoSuccess = false, 3000);
    }, 800);
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.authService.updateUserPhoto('');
  }
  // Logout action
  onLogout(): void {
    // Placeholder: perform logout via AuthService
    this.authService.logout();
  }

  // Format phone number to international format (+216 xx xxx xxx)
  formatPhone(phone: string | undefined): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 8) {
      return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return phone;
  }

}
