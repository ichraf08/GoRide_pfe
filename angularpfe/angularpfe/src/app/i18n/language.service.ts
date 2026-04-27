import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface LanguageOption {
  code: 'fr' | 'en';
  label: 'FR' | 'EN';
}

const STORAGE_KEY = 'app_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  readonly supported: LanguageOption[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' }
  ];

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(this.supported.map(l => l.code));
    this.translate.setDefaultLang('fr');

    const saved = (localStorage.getItem(STORAGE_KEY) as LanguageOption['code'] | null) ?? undefined;
    const browser = this.translate.getBrowserLang() as LanguageOption['code'] | undefined;

    const initial = saved ?? (browser === 'en' ? 'en' : 'fr');
    this.use(initial);
  }

  get current(): LanguageOption['code'] {
    return (this.translate.currentLang as LanguageOption['code']) || 'fr';
  }

  use(code: LanguageOption['code']): void {
    if (!this.supported.some(l => l.code === code)) {
      code = 'fr';
    }

    localStorage.setItem(STORAGE_KEY, code);
    // Recharge le fichier de traduction pour refléter les nouvelles clés ajoutées pendant le dev.
    // (ex: NAV.ABOUT) puis active la langue.
    this.translate.reloadLang(code).subscribe({
      next: () => this.translate.use(code).subscribe(),
      error: () => this.translate.use(code).subscribe()
    });

    // Met à jour l'attribut lang de la page.
    document.documentElement.lang = code;
  }
}



