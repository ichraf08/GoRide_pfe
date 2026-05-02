import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  loading = true;
  error: string | null = null;
  activeTab = 'overview';

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchProfile();

    this.authService.user$.subscribe(user => {
      if (user) {
        this.user = { ...this.user, ...user };
      }
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  fetchProfile(): void {
    this.loading = true;
    this.http.get('http://localhost:8081/api/users/me').subscribe({
      next: (data: any) => {
        this.user = data;
        this.authService.updateUser(data); 
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Erreur profil:', err);
        const localUser = this.authService.getCurrentUser();
        if (localUser) {
          this.user = localUser;
        } else {
          this.error = 'Impossible de charger le profil.';
        }
        this.loading = false;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }
}
