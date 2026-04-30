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

    // 2. Si un rôle est requis, vérifier que l'utilisateur l'a ET que c'est son rôle actif
    const requiredRole = route.data['role'] as string;
    if (requiredRole) {
      const hasRole = this.authService.hasRole(requiredRole);
      const isActiveRole = this.authService.getActiveRole() === requiredRole;

      if (!hasRole) {
        // L'utilisateur n'a pas du tout ce rôle → retour à l'accueil
        this.router.navigate(['/acceuil']);
        return false;
      }

      if (!isActiveRole) {
        // L'utilisateur a le rôle mais ce n'est pas son rôle actif → changer de rôle ou bloquer ?
        // On autorise si l'utilisateur possède le rôle, mais on pourrait forcer le switch ici.
        // Pour plus de souplesse, on laisse passer si le rôle est possédé, 
        // le switch de rôle se chargera de la navigation principale.
      }
    }

    return true;
  }
}
