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
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]]
  });

  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hidePassword = true;
  showForgotPassword = false;

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

  toggleForgotPassword(): void {
    this.showForgotPassword = !this.showForgotPassword;
    this.errorMessage = null;
    this.successMessage = null;
    this.isSubmitting = false;
  }

  toggleLanguage(): void {
    const next: LanguageOption['code'] = this.languageService.current === 'en' ? 'fr' : 'en';
    this.languageService.use(next);
  }

  // Getter pour un accès facile aux champs du formulaire depuis le template
  get f() { return this.form.controls; }
  get ff() { return this.forgotForm.controls; }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    this.isSubmitting = true;

    this.authService
      .login({ email: normalizedEmail, password: password ?? '' })
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
            this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Impossible de contacter le serveur. Veuillez réessayer.';
          }
        }
      });
  }

  submitForgot(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const email = this.forgotForm.value.email ?? '';

    this.authService.forgotPassword(email)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.successMessage = "Un lien de récupération a été envoyé à votre adresse email.";
          this.forgotForm.reset();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Une erreur est survenue.";
        }
      });
  }
}
