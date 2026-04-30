import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageOption, LanguageService } from '../i18n/language.service';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private readonly mobileBreakpoint = 992;
  isNavbarOpen = false;
  isUserDropdownOpen = false;
  isNotificationDropdownOpen = false;
  
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;
  private notificationSub?: Subscription;
  private unreadSub?: Subscription;

  availableRoles: any[] = [];

  private roleDefinitions: Record<string, any> = {
    'ROLE_CLIENT': { id: 'ROLE_CLIENT', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981' },
    'ROLE_USER': { id: 'ROLE_USER', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981' },
    'ROLE_DRIVER': { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-car', route: '/driver/home', color: '#2563eb' },
    'ROLE_FLEET_OWNER': { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', route: '/fleet/home', color: '#f59e0b' },
    'ROLE_COMPANY': { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-briefcase', route: '/company/home', color: '#4b5563' },
    'ROLE_ADMIN': { id: 'ROLE_ADMIN', label: 'Admin', icon: 'ion-ios-settings', route: '/admin/home', color: '#ef4444' }
  };

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly languageService: LanguageService,
    public readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.authService.activeRole$.subscribe(() => {
      this.loadUserRoles();
    });

    // Souscrire aux notifications
    this.notificationSub = this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
    });

    this.unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotificationsCount = count;
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  loadUserRoles(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.roles) {
      const userRoles = [...user.roles];
      
      this.availableRoles = userRoles
        .map(roleName => {
          const normalizedRole = roleName.startsWith('ROLE_') ? roleName : 'ROLE_' + roleName;
          return this.roleDefinitions[normalizedRole] || { id: normalizedRole, label: roleName, icon: 'ion-ios-settings', route: '/acceuil', color: '#6c757d' };
        })
        // Fusionner ROLE_CLIENT et ROLE_USER sous un seul label "Client"
        .filter((role, index, self) => 
          index === self.findIndex((r) => r.label === role.label)
        );
      
      // Retirer les doublons
      this.availableRoles = this.availableRoles.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    if (this.isNotificationDropdownOpen) {
      this.isUserDropdownOpen = false;
      this.notificationService.fetchNotifications().subscribe();
    }
  }

  markNotificationAsRead(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id).subscribe();
    }
    if (notif.targetUrl) {
      this.isNotificationDropdownOpen = false;
      this.router.navigateByUrl(notif.targetUrl);
    }
  }

  markAllNotificationsAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return 'ion-ios-checkmark-circle';
      case 'WARNING': return 'ion-ios-warning';
      case 'DANGER': return 'ion-ios-close-circle';
      default: return 'ion-ios-information-circle';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'SUCCESS': return '#10b981';
      case 'WARNING': return '#f59e0b';
      case 'DANGER': return '#ef4444';
      default: return '#2563eb';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString();
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    if (this.isUserDropdownOpen) {
      this.isNotificationDropdownOpen = false;
      this.loadUserRoles(); 
    }
  }

  switchRole(roleId: string, route: string): void {
    this.authService.setActiveRole(roleId);
    this.closeAllMenus();
    this.router.navigateByUrl(route).then(() => {
      // Navigation réussie
    });
  }

  navigateTo(route: string): void {
    this.closeAllMenus();
    this.router.navigateByUrl(route);
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  get currentUserFullName(): string {
    const user = this.currentUser;
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  get activeRoleLabel(): string {
    const role = this.authService.getActiveRole();
    switch (role) {
      case 'ROLE_DRIVER': return 'Chauffeur';
      case 'ROLE_FLEET_OWNER': return 'Propriétaire';
      case 'ROLE_COMPANY': return 'Entreprise';
      case 'ROLE_ADMIN': return 'Admin';
      default: return 'Client';
    }
  }

  get dashboardRoute(): string {
    const role = this.authService.getActiveRole();
    if (!role) return '/acceuil';
    return this.roleDefinitions[role]?.route || '/acceuil';
  }

  logout(): void {
    this.authService.logout();
    this.closeAllMenus();
  }

  get currentLanguageLabel(): string {
    return (this.languageService.current || 'fr').toUpperCase();
  }

  toggleLanguage(event: Event): void {
    event.stopPropagation();
    const next: LanguageOption['code'] = this.languageService.current === 'en' ? 'fr' : 'en';
    this.languageService.use(next);
  }

  toggleNavbar(event: Event): void {
    event.stopPropagation();
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeAllMenus(): void {
    this.isNavbarOpen = false;
    this.isUserDropdownOpen = false;
    this.isNotificationDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeAllMenus();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth >= this.mobileBreakpoint) {
      this.isNavbarOpen = false;
    }
  }

}
