import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { LanguageOption, LanguageService } from '../i18n/language.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  isSubmitting = false;
  errorMessage: string | null = null;
  hidePassword = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly languageService: LanguageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  get currentLanguageLabel(): string {
    return (this.languageService.current || 'fr').toUpperCase();
  }

  toggleLanguage(): void {
    const next: LanguageOption['code'] = this.languageService.current === 'en' ? 'fr' : 'en';
    this.languageService.use(next);
  }

  // Getter pour un accès facile aux champs du formulaire depuis le template
  get f() {
    return this.form.controls;
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .login({ email: email ?? '', password: password ?? '' })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          const activeRole = this.authService.getActiveRole();
          switch (activeRole) {
            case 'ROLE_DRIVER':
              this.router.navigateByUrl('/driver/home');
              break;
            case 'ROLE_FLEET_OWNER':
              this.router.navigateByUrl('/fleet/home');
              break;
            case 'ROLE_COMPANY':
              this.router.navigateByUrl('/company/home');
              break;
            case 'ROLE_ADMIN':
              this.router.navigateByUrl('/admin/home');
              break;
            default:
              this.router.navigateByUrl('/acceuil');
              break;
          }
        },
        error: (err: any) => {
          console.error('Erreur login:', err);
          if (err.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Impossible de contacter le serveur. Veuillez réessayer.';
          }
        }
      });
  }
}
