import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.loading = true;
    this.http.get('http://localhost:8081/api/users/me').subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur profil:', err);
        this.error = 'Impossible de charger le profil.';
        this.loading = false;
      }
    });
  }

  getRoleLabel(role: string): string {
    const roles: any = {
      'ROLE_CLIENT': 'Client',
      'ROLE_DRIVER': 'Chauffeur',
      'ROLE_FLEET_OWNER': 'Propriétaire de Flotte',
      'ROLE_COMPANY': 'Entreprise',
      'ROLE_ADMIN': 'Administrateur'
    };
    return roles[role] || role;
  }
}
