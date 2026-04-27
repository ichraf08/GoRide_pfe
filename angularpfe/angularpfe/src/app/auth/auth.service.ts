import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Connexion — envoie email/password au backend et stocke le JWT reçu.
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(API_URL + 'login', request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response));
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.isLoggedInSubject.next(false);
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

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
