import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  message: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  submit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = null;
    this.errorMessage = null;

    this.authService.forgotPassword(this.forgotForm.value.email)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.forgotForm.reset();
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
          } else {
            this.errorMessage = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });
  }
}
