import { Component } from '@angular/core';
import { LanguageService } from './i18n/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  title = 'angularpfe';
  // Injection pour initialiser la langue au démarrage (via localStorage / navigateur)
  constructor(private readonly _language: LanguageService) {}
}

