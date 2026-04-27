import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard qui protège les routes nécessitant une authentification.
 * Redirige vers /login si l'utilisateur n'est pas connecté.
 *
 * Utilisation dans le routing :
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
 *
 * Pour vérifier un rôle spécifique, ajoutez data.role :
 *   { path: 'driver', component: DriverComponent, canActivate: [AuthGuard], data: { role: 'ROLE_DRIVER' } }
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // 1. Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Si un rôle est requis, vérifier que l'utilisateur l'a
    const requiredRole = route.data['role'] as string;
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // L'utilisateur est connecté mais n'a pas le bon rôle → retour à l'accueil
      this.router.navigate(['/acceuil']);
      return false;
    }

    return true;
  }
}
