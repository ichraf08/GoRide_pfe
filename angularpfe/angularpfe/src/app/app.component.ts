import { Component } from '@angular/core';
import { LanguageService } from './i18n/language.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angularpfe';
  currentUrl = window.location.href;

  constructor(
    private readonly _language: LanguageService,
    private router: Router
  ) {
    // Mettre à jour l'URL affichée à chaque changement de navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = window.location.origin + event.url;
      console.log("Navigation détectée vers :", this.currentUrl);
    });
  }
}
