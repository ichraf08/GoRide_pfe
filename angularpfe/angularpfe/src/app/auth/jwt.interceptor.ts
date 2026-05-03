import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Intercepteur HTTP qui ajoute automatiquement le token JWT
 * dans le header "Authorization" de chaque requête sortante.
 *
 * Grâce à cet intercepteur, vous n'avez pas besoin d'ajouter
 * manuellement le header dans chaque appel HTTP.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const isAuthRoute = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/signup');

    if (token && !isAuthRoute) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
