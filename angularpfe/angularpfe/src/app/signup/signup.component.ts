import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, SignupRequest } from '../auth/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Wizard State
  currentStep = 1;
  totalSteps = 4;

  // Map roles to images and content
  visualDataMap: Record<string, { image: string, title: string, highlight: string, subtitle: string, features: string[] }> = {
    'CLIENT': {
      image: '/assets/images/goride-client-bg.png',
      title: 'Une seule plateforme,',
      highlight: 'toutes les mobilités',
      subtitle: 'Optimisez chaque trajet et déplacez-vous en toute sérénité.',
      features: ['Réservation instantanée', 'Chauffeurs certifiés']
    },
    'USER': {
      image: '/assets/images/goride-client-bg.png',
      title: 'Votre chauffeur,',
      highlight: 'à votre porte',
      subtitle: 'Commandez un trajet en toute simplicité avec GoRide.',
      features: ['Trajets sécurisés', 'Prix transparents']
    },
    'DRIVER': {
      image: '/assets/images/goride-driver-bg.png',
      title: 'Prenez le volant,',
      highlight: 'augmentez vos revenus',
      subtitle: 'Conduisez à votre rythme et rentabilisez votre véhicule.',
      features: ['Horaires flexibles', 'Paiements rapides']
    },
    'FLEET_OWNER': {
      image: '/assets/images/goride-fleet-bg.png',
      title: 'Gérez votre flotte,',
      highlight: 'maximisez vos profits',
      subtitle: 'Développez votre activité avec nos outils de gestion avancés.',
      features: ['Tableau de bord pro', 'Suivi en temps réel']
    },
    'COMPANY': {
      image: '/assets/images/goride-company-bg.png',
      title: 'La mobilité pensée',
      highlight: 'pour votre entreprise',
      subtitle: 'Optimisez les déplacements de tous vos collaborateurs.',
      features: ['Facturation simplifiée', 'Gestion centralisée']
    }
  };

  roles = [
    { 
      value: 'DRIVER', 
      label: 'Devenir partenaire chauffeur', 
      desc: 'Générez des revenus selon vos conditions', 
      icon: 'ion-ios-person',
      iconColor: '#2563eb'
    },
    { 
      value: 'CLIENT', 
      label: 'Commander une voiture', 
      desc: 'Réservez un véhicule selon vos besoins', 
      icon: 'ion-ios-car',
      iconColor: '#10b981'
    },
    { 
      value: 'USER', 
      label: 'Passer un trajet', 
      desc: 'Commandez un trajet et laissez-nous vous conduire', 
      icon: 'flaticon-route',
      iconColor: '#f59e0b'
    },
    { 
      value: 'FLEET_OWNER', 
      label: 'Inscrivez-vous en tant que propriétaire de flotte', 
      desc: 'Ajoutez votre flotte sur GoRide et augmentez vos revenus', 
      icon: 'ion-ios-people',
      iconColor: '#059669'
    },
    { 
      value: 'COMPANY', 
      label: 'Entreprises', 
      desc: 'Produits et services adaptés à votre entreprise', 
      icon: 'ion-ios-briefcase',
      iconColor: '#4b5563'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const roleParam = this.route.snapshot.queryParamMap.get('role') || 'CLIENT';
    this.initForm(roleParam);
  }

  private initForm(role: string): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: [role, [Validators.required]],
      hasFleet: [false]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  nextStep(): void {
    if (this.canGoNext()) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) {
      return this.signupForm.get('firstName')!.valid && 
             this.signupForm.get('lastName')!.valid && 
             this.signupForm.get('email')!.valid;
    }
    if (this.currentStep === 2) {
      return this.signupForm.get('role')!.valid;
    }
    if (this.currentStep === 3) {
      return this.signupForm.get('phone')!.valid;
    }
    return true;
  }

  updateRole(roleValue: string): void {
    this.signupForm.patchValue({ role: roleValue });
  }

  get currentRole(): string {
    return this.signupForm?.get('role')?.value || 'CLIENT';
  }

  get currentVisualData(): { image: string, title: string, highlight: string, subtitle: string, features: string[] } {
    return this.visualDataMap[this.currentRole] || this.visualDataMap['CLIENT'];
  }

  // Getter for easy access to form fields
  get f() {
    return this.signupForm.controls;
  }

  submit(): void {
    if (this.signupForm.invalid) return;
    this.isSubmitting = true;
    this.authService.signup(this.signupForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => this.errorMessage = err.error?.message || "Erreur"
      });
  }
}
