import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  trajetsCount: number = 0;
  usersCount: number = 0;
  ratingCount: string = '0';
  statsAnimated: boolean = false;
  selectedSubject: string = 'Choisissez votre demande';
  isDropdownOpen: boolean = false;
  
  // Auth state
  isLoggedIn: boolean = false;
  user: any = null;
  activeRole: string = '';
  availableRoles: any[] = [];
  isRoleSwitcherOpen: boolean = false;
  private subs: Subscription = new Subscription();

  private roleDefinitions: Record<string, any> = {
    'ROLE_CLIENT': { id: 'ROLE_CLIENT', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981', action: 'Réserver un trajet' },
    'ROLE_USER': { id: 'ROLE_USER', label: 'Client', icon: 'ion-ios-person', route: '/client/home', color: '#10b981', action: 'Louer un véhicule' },
    'ROLE_DRIVER': { id: 'ROLE_DRIVER', label: 'Chauffeur', icon: 'ion-ios-car', route: '/driver/home', color: '#2563eb', action: 'Prendre le volant' },
    'ROLE_FLEET_OWNER': { id: 'ROLE_FLEET_OWNER', label: 'Propriétaire', icon: 'ion-ios-people', route: '/fleet/home', color: '#f59e0b', action: 'Gérer ma flotte' },
    'ROLE_COMPANY': { id: 'ROLE_COMPANY', label: 'Entreprise', icon: 'ion-ios-business', route: '/company/home', color: '#4b5563', action: 'Espace Entreprise' },
    'ROLE_ADMIN': { id: 'ROLE_ADMIN', label: 'Admin', icon: 'ion-ios-settings', route: '/admin/home', color: '#ef4444', action: 'Administration' }
  };
  
  subjects: any[] = [
    { label: 'Assistance client', icon: 'ion-ios-help-buoy' }, 
    { label: 'Rejoindre GoRide comme chauffeur', icon: 'ion-ios-car' }, 
    { label: 'Solution entreprise', icon: 'ion-ios-business' }, 
    { label: 'Partenariat', icon: 'ion-ios-people' }, 
    { label: 'Autre demande', icon: 'ion-ios-chatbubbles' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.authService.isLoggedIn$.subscribe(status => {
        this.isLoggedIn = status;
      })
    );

    this.subs.add(
      this.authService.user$.subscribe(user => {
        this.user = user || this.authService.getCurrentUser();
        this.loadUserRoles();
      })
    );

    this.subs.add(
      this.authService.activeRole$.subscribe(role => {
        if (role) {
          this.activeRole = role;
        } else {
          this.activeRole = this.authService.getActiveRole() || '';
        }
      })
    );
  }

  loadUserRoles(): void {
    if (this.user && this.user.roles) {
      const userRoles = [...this.user.roles];
      this.availableRoles = userRoles
        .map((roleName: string) => {
          const normalizedRole = roleName.startsWith('ROLE_') ? roleName : 'ROLE_' + roleName;
          return this.roleDefinitions[normalizedRole] || { id: normalizedRole, label: roleName, icon: 'ion-ios-settings', route: '/acceuil', color: '#6c757d', action: 'Ouvrir' };
        })
        .filter((role: any, index: number, self: any[]) => 
          index === self.findIndex((r) => r.label === role.label)
        );
    }
  }

  toggleRoleSwitcher(): void {
    this.isRoleSwitcherOpen = !this.isRoleSwitcherOpen;
  }

  switchRole(roleId: string): void {
    this.authService.setActiveRole(roleId);
    this.isRoleSwitcherOpen = false;
  }

  getActiveRoleData(): any {
    return this.roleDefinitions[this.activeRole] || this.roleDefinitions['ROLE_CLIENT'];
  }

  get currentUser(): any {
    return {
      name: this.user?.firstName || 'ichraf'
    };
  }

  goToDashboard(): void {
    const roleData = this.getActiveRoleData();
    if (roleData && roleData.route) {
      this.router.navigate([roleData.route]);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectSubject(subject: string) {
    this.selectedSubject = subject;
    this.isDropdownOpen = false;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    this.initOwlCarousel();
    this.initScrollAnimation();
  }

  private initOwlCarousel() {
    setTimeout(() => {
      if ($('.carousel-services').length > 0) {
        $('.carousel-services').owlCarousel({
          center: false,
          loop: true,
          autoplay: true,
          autoplayTimeout: 5000,
          items: 1,
          margin: 30,
          stagePadding: 0,
          nav: false,
          dots: true,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 4 }
          }
        });
      }
    }, 500);
  }

  private initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateStats();
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-bar-new');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  private animateStats() {
    this.animateValue(0, 152, 2000, (v) => this.trajetsCount = Math.floor(v));
    this.animateValue(0, 87, 2000, (v) => this.usersCount = Math.floor(v));
    this.animateValue(0, 4.8, 2000, (v) => this.ratingCount = v.toFixed(1));
  }

  private animateValue(start: number, end: number, duration: number, callback: (val: number) => void) {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * (end - start) + start;
      callback(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}
