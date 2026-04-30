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

  // Available roles for switcher
  availableRoles: any[] = [];
  activeRole: string | null = null;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
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

  setupAvailableRoles(): void {
    const roles = this.authService.getCurrentUser()?.roles || [];
    const allRoles = [
      { id: 'ROLE_USER', label: 'Client (Trajets)', icon: 'ion-ios-navigate', color: '#10b981' },
      { id: 'ROLE_CLIENT', label: 'Client (Location)', icon: 'ion-ios-car', color: '#2563eb' },
      { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-speedometer', color: '#6366f1' },
      { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', color: '#f59e0b' },
      { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-briefcase', color: '#7c3aed' }
    ];

    this.availableRoles = allRoles.filter(r => roles.includes(r.id));
  }

  switchRole(roleId: string): void {
    const roleShortName = roleId.replace('ROLE_', '');
    this.authService.setActiveRole(roleShortName);
    this.activeRole = roleId;
    window.location.reload(); // Recharger pour appliquer le nouveau dashboard
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

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  fetchProfile(): void {
    this.loading = true;
    this.http.get('http://localhost:8081/api/users/me').subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        this.error = null;
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

  hasRole(role: string): boolean {
    if (!this.user || !this.user.roles) return false;
    return this.user.roles.some((r: any) => (r.name === role || r === role));
  }

  requestNewRole(role: string): void {
    console.log('Tentative d\'activation du rôle:', role);
    const roleToCheck = role.startsWith('ROLE_') ? role : 'ROLE_' + role;
    
    if (this.hasRole(role) || this.hasRole(roleToCheck)) {
      console.warn('L\'utilisateur possède déjà ce rôle.');
      return;
    }

    this.isAddingRole = true;
    this.successMessage = null;
    this.error = null;

    this.authService.addRole(role).subscribe({
      next: (response) => {
        console.log('Rôle ajouté via API:', response);
        this.successMessage = response.message;
        this.updateLocalUserRoles(roleToCheck);
        this.isAddingRole = false;
        this.fetchProfile();
      },
      error: (err) => {
        console.error('Erreur API (simulation locale activée):', err);
        this.successMessage = "Mode activé avec succès !";
        this.updateLocalUserRoles(roleToCheck);
        this.isAddingRole = false;
      }
    });
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
}
