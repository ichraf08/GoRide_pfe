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
  role: string; // CLIENT, DRIVER, FLEET_OWNER, COMPANY
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
  roles: string[];
  photoUrl?: string;
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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
    return this.http.post<MessageResponse>(API_URL + 'add-role', { role }).pipe(
      tap(() => {
        // Optionnel : on pourrait rafraîchir les infos utilisateur ici
        // Mais pour l'instant on laisse l'utilisateur basculer manuellement
      })
    );
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

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
