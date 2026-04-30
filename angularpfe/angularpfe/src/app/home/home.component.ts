import { Component, AfterViewInit } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  trajetsCount: number = 0;
  usersCount: number = 0;
  ratingCount: string = '0';
  statsAnimated: boolean = false;
  selectedSubject: string = 'Choisissez votre demande';
  isDropdownOpen: boolean = false;
  
  subjects: any[] = [
    { label: 'Assistance client', icon: 'ion-ios-help-buoy' }, 
    { label: 'Rejoindre GoRide comme chauffeur', icon: 'ion-ios-car' }, 
    { label: 'Solution entreprise', icon: 'ion-ios-business' }, 
    { label: 'Partenariat', icon: 'ion-ios-people' }, 
    { label: 'Autre demande', icon: 'ion-ios-chatbubbles' }
  ];

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
