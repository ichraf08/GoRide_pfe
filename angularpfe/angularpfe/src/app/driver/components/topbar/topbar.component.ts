import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { DriverProfile } from '../../models/driver.models';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  profile: DriverProfile | null = null;
  isOnline = true;
  availableRoles: any[] = [];
  isUserDropdownOpen = false;

  private roleDefinitions: Record<string, any> = {
    'ROLE_CLIENT': { id: 'ROLE_CLIENT', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981' },
    'ROLE_USER': { id: 'ROLE_USER', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981' },
    'ROLE_DRIVER': { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-car', route: '/driver/home', color: '#2563eb' },
    'ROLE_FLEET_OWNER': { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', route: '/fleet/home', color: '#f59e0b' },
    'ROLE_COMPANY': { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-briefcase', route: '/company/home', color: '#4b5563' },
    'ROLE_ADMIN': { id: 'ROLE_ADMIN', label: 'Admin', icon: 'ion-ios-settings', route: '/admin/home', color: '#ef4444' }
  };

  constructor(
    private router: Router,
    private driverService: DriverService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.driverService.getProfile().subscribe(p => this.profile = p);
    this.driverService.isOnline$.subscribe(status => this.isOnline = status);
    
    this.authService.activeRole$.subscribe(() => {
      this.loadUserRoles();
    });
  }

  loadUserRoles(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.roles) {
      const userRoles = [...user.roles];

      this.availableRoles = userRoles
        .map((roleName: string) => {
          const normalizedRole = roleName.startsWith('ROLE_') ? roleName : 'ROLE_' + roleName;
          return this.roleDefinitions[normalizedRole] || { id: normalizedRole, label: roleName, icon: 'ion-ios-settings', route: '/acceuil', color: '#6c757d' };
        })
        .filter((role: any, index: number, self: any[]) => 
          index === self.findIndex((r) => r.label === role.label)
        );

      this.availableRoles = this.availableRoles.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }
  }

  switchRole(roleId: string, route: string): void {
    this.authService.setActiveRole(roleId);
    this.router.navigateByUrl(route);
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  toggleDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleStatus(): void {
    this.driverService.toggleOnlineStatus().subscribe();
  }

  goToProfile(): void {
    this.router.navigate(['/driver/profile']);
  }

  logout(): void {
    this.authService.logout();
  }
}
