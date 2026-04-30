import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-ride',
  templateUrl: './book-ride.component.html',
  styleUrls: ['./book-ride.component.css']
})
export class BookRideComponent implements OnInit {
  bookingStep: 'idle' | 'searching' | 'confirmed' = 'idle';
  selectedService: string = 'Economy';
  estimatedPrice: number = 12.5;
  destination: string = '';

  constructor() {}

  ngOnInit(): void {}

  selectService(service: string, price: number): void {
    this.selectedService = service;
    this.estimatedPrice = price;
  }

  confirmBooking(): void {
    if (!this.destination) {
      alert('Veuillez entrer une destination');
      return;
    }

    this.bookingStep = 'searching';
    
    // Simuler la recherche d'un chauffeur (3 secondes)
    setTimeout(() => {
      this.bookingStep = 'confirmed';
      this.saveBookingToHistory();
    }, 3000);
  }

  private saveBookingToHistory(): void {
    const newBooking = {
      id: Math.floor(Math.random() * 10000),
      service: this.selectedService,
      price: this.estimatedPrice,
      destination: this.destination,
      date: new Date().toISOString(),
      status: 'Terminé'
    };
    
    const history = JSON.parse(localStorage.getItem('goride_history') || '[]');
    history.unshift(newBooking);
    localStorage.setItem('goride_history', JSON.stringify(history));
  }

  reset(): void {
    this.bookingStep = 'idle';
    this.destination = '';
  }
}
