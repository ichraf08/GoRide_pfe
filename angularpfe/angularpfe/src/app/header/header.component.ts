import { Component, ElementRef, HostListener } from '@angular/core';
import { LanguageOption, LanguageService } from '../i18n/language.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private readonly mobileBreakpoint = 992;
  isNavbarOpen = false;
  isUserDropdownOpen = false;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly languageService: LanguageService,
    public readonly authService: AuthService
  ) {
  }

  get currentUserFullName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
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
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
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
