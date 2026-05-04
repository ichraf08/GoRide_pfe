import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// =============================================
// Interfaces (DTOs côté Angular)
// =============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  roles: string[]; // CLIENT, DRIVER, FLEET_OWNER, COMPANY
  city?: string;
  hasFleet?: boolean;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  secondaryEmail?: string;
  roles: string[];
  photoUrl?: string;
  phone?: string;
  address?: string;
}

export interface MessageResponse {
  message: string;
}

// =============================================
// Service d'authentification
// =============================================

const API_URL = 'http://localhost:8081/api/auth/';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ACTIVE_ROLE_KEY = 'auth_active_role';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private activeRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem(ACTIVE_ROLE_KEY));
  readonly activeRole$ = this.activeRoleSubject.asObservable();

  private userSubject = new BehaviorSubject<JwtResponse | null>(this.getCurrentUser());
  readonly user$ = this.userSubject.asObservable();

  private roleDefinitions: Record<string, any> = {
    'ROLE_CLIENT': { id: 'ROLE_CLIENT', label: 'Client (Location)', icon: 'ion-ios-car', route: '/client/home', color: '#10b981', action: 'Réserver un trajet' },
    'ROLE_USER': { id: 'ROLE_USER', label: 'Client (Trajets)', icon: 'ion-ios-navigate', route: '/client/home', color: '#10b981', action: 'Commander un trajet' },
    'ROLE_DRIVER': { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-speedometer', route: '/driver/home', color: '#2563eb', action: 'Prendre le volant' },
    'ROLE_FLEET_OWNER': { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', route: '/fleet/home', color: '#f59e0b', action: 'Gérer ma flotte' },
    'ROLE_COMPANY': { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-business', route: '/company/home', color: '#4b5563', action: 'Espace Entreprise' },
    'ROLE_ADMIN': { id: 'ROLE_ADMIN', label: 'Admin', icon: 'ion-ios-settings', route: '/admin/home', color: '#ef4444', action: 'Administration' }
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getActiveRoleData(): any {
    const activeRole = this.getActiveRole() || 'ROLE_USER';
    const normalizedRole = activeRole.startsWith('ROLE_') ? activeRole : 'ROLE_' + activeRole;
    return this.roleDefinitions[normalizedRole] || this.roleDefinitions['ROLE_USER'];
  }

  /**
   * Connexion — envoie email/password au backend et stocke le JWT reçu.
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(API_URL + 'login', request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response));
        
        if (response.roles && response.roles.length > 0) {
          this.setActiveRole(response.roles[0]);
        }
        
        this.userSubject.next(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  /**
   * Logique de redirection centralisée après connexion ou inscription
   */
  handleAuthSuccess(returnUrl?: string | null): void {
    if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/signup') && !returnUrl.includes('/profile')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    const user = this.getCurrentUser();
    const roles = user?.roles || [];

    // Si l'utilisateur possède plusieurs rôles -> Page de choix
    if (roles.length > 1) {
      this.router.navigate(['/role-selection']);
      return;
    }

    // Si l'utilisateur a un seul rôle -> Redirection directe au dashboard
    const singleRole = roles.length === 1 ? roles[0] : 'ROLE_CLIENT';
    this.setActiveRole(singleRole);
    
    const roleData = this.getActiveRoleData();
    if (roleData && roleData.route) {
      this.router.navigate([roleData.route]);
    } else {
      this.router.navigate(['/client/home']); // Route par défaut
    }
  }

  /**
   * Inscription — crée un compte avec le rôle spécifié.
   */
  signup(request: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_URL + 'signup', request);
  }

  /**
   * Déconnexion — supprime le token et les données utilisateur.
   */
  logout(): void {
    console.log('Logging out user...');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    this.isLoggedInSubject.next(false);
    this.activeRoleSubject.next(null);
    this.router.navigate(['/acceuil']).then(() => {
      window.location.reload(); // Force le rechargement pour vider les états restants
    });
  }

  /**
   * Retourne le token JWT stocké (ou null).
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Retourne les infos de l'utilisateur connecté.
   */
  getCurrentUser(): JwtResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Vérifie si l'utilisateur possède un rôle donné.
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  /**
   * Vérifie si l'utilisateur est connecté (token présent).
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Définit le rôle actif actuel.
   */
  setActiveRole(role: string): void {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    this.activeRoleSubject.next(role);
    // On notifie aussi un changement d'utilisateur pour forcer la réactivité
    this.userSubject.next(this.getCurrentUser());
  }

  /**
   * Retourne le rôle actif actuel.
   */
  getActiveRole(): string | null {
    return this.activeRoleSubject.value;
  }

  /**
   * Ajoute un rôle à l'utilisateur actuel (API).
   */
  addRole(role: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_URL + 'add-role', { role });
  }

  /**
   * Supprime un rôle de l'utilisateur actuel (API).
   */
  removeRole(role: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_URL + 'remove-role', { role });
  }

  /**
   * Met à jour les infos de l'utilisateur dans le localStorage et notifie les composants.
   */
  updateUser(userData: any): void {
    const user = this.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      this.userSubject.next(updatedUser);
    }
  }

  /**
   * Met à jour la photo de profil localement et notifie les composants.
   */
  updateUserPhoto(photoUrl: string): void {
    const user = this.getCurrentUser();
    if (user) {
      user.photoUrl = photoUrl;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.userSubject.next(user);
    }
  }

  /**
   * Demander un lien de réinitialisation de mot de passe.
   */
  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_URL + 'forgot-password', { email });
  }

  /**
   * Réinitialiser le mot de passe avec le token.
   */
  resetPassword(request: { token: string | null, newPassword: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_URL + 'reset-password', request);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
