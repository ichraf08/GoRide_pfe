import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rent-vehicle',
  templateUrl: './rent-vehicle.component.html',
  styleUrls: ['./rent-vehicle.component.css']
})
export class RentVehicleComponent implements OnInit {
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  selectedCategory: string = 'Tout';

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicles = [
      { id: 1, brand: 'Volkswagen', model: 'Golf 7', type: 'Économique', price: 90, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400' },
      { id: 2, brand: 'BMW', model: 'Série 5', type: 'Luxe', price: 250, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400' },
      { id: 3, brand: 'Kia', model: 'Sportage', type: 'SUV', price: 150, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400' },
      { id: 4, brand: 'Peugeot', model: '3008', type: 'SUV', price: 140, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400' }
    ];
    this.filteredVehicles = [...this.vehicles];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'Tout') {
      this.filteredVehicles = [...this.vehicles];
    } else {
      this.filteredVehicles = this.vehicles.filter(v => v.type === category);
    }
  }

  requestRental(vehicle: any): void {
    alert(`Demande de location envoyée pour la ${vehicle.brand} ${vehicle.model}. Vous recevrez une confirmation sous peu.`);
  }
}
