import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string | null = null;

  passwordRules = {
    length: false,
    upper: false,
    number: false,
    symbol: false
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}')]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.resetForm.get('password')?.valueChanges.subscribe(val => {
      const pwd = val || '';
      this.passwordRules.length = pwd.length >= 8;
      this.passwordRules.number = /[0-9]/.test(pwd);
      this.passwordRules.symbol = /[^A-Za-z0-9]/.test(pwd);
    });
  }

  ngOnInit(): void {
    console.log("ResetPasswordComponent chargé. Analyse de l'URL...");
    
    // 1. Chercher dans les Query Params (?token=...)
    let foundToken = this.route.snapshot.queryParamMap.get('token');
    
    // 2. Si non trouvé, chercher dans les Path Params (/:token)
    if (!foundToken) {
      foundToken = this.route.snapshot.paramMap.get('token');
    }

    this.token = foundToken;
    console.log("Token extrait du snapshot :", this.token);
    
    // Écoute dynamique
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });

    this.route.params.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });

    if (!this.token) {
      console.warn("Aucun token trouvé dans l'URL !");
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get f() {
    return this.resetForm.controls;
  }

  submit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const newPassword = this.resetForm.value.password;

    // Appel au service avec l'objet attendu par le backend { token, password }
    this.authService.resetPassword({ token: this.token, newPassword: newPassword })
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.successMessage = "Votre mot de passe a été réinitialisé avec succès.";
          this.resetForm.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Le lien est invalide ou a expiré.";
        }
      });
  }
}
