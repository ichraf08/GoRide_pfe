import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, JwtResponse } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  activeTab = 'info';
  isEditing = false;
  user: JwtResponse | null = null;
  activeRole: string = 'Utilisateur';
  badgeLabel: string = 'Membre Standard';
  
  infoForm!: FormGroup;
  securityForm!: FormGroup;

  saveSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initForms();
    this.setupRoleInfo();
  }

  setupRoleInfo(): void {
    const roleData = this.authService.getActiveRoleData();
    this.activeRole = roleData ? roleData.label : 'Utilisateur';
    
    // Define badges based on roles
    const badges: Record<string, string> = {
      'ROLE_CLIENT': 'Client Premium',
      'ROLE_USER': 'Passager Régulier',
      'ROLE_DRIVER': 'Chauffeur Partenaire',
      'ROLE_FLEET_OWNER': 'Gestionnaire Flotte',
      'ROLE_COMPANY': 'Compte Entreprise',
      'ROLE_ADMIN': 'Administrateur'
    };
    
    const currentRoleKey = this.authService.getActiveRole() || 'ROLE_USER';
    this.badgeLabel = badges[currentRoleKey] || 'Membre';
  }

  initForms(): void {
    this.infoForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || '', Validators.required],
      address: [this.user?.address || '']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to current user values if cancelled
      this.infoForm.patchValue({
        firstName: this.user?.firstName,
        lastName: this.user?.lastName,
        email: this.user?.email,
        phone: this.user?.phone,
        address: this.user?.address
      });
    }
  }

  saveInfo(): void {
    if (this.infoForm.valid) {
      // TODO: Call API to update user
      console.log('Saved info', this.infoForm.value);
      this.authService.updateUser(this.infoForm.value);
      this.user = this.authService.getCurrentUser();
      this.isEditing = false;
      this.showToast();
    }
  }

  updateSecurity(): void {
    if (this.securityForm.valid) {
      // TODO: Call API to update password
      console.log('Security updated');
      this.securityForm.reset();
      this.showToast();
    }
  }

  showToast(): void {
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }

  triggerPhotoUpload(): void {
    // Simule le clic sur input file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // En conditions réelles : uploader sur le serveur
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.authService.updateUserPhoto(event.target.result);
          this.user = this.authService.getCurrentUser();
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }
}
