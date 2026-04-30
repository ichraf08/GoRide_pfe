import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit {
  user: any = null;
  loading = true;

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
        console.error('Erreur dashboard:', err);
        this.loading = false;
      }
    });
  }
}
