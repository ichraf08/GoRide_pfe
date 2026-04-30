import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {
  pendingVehicles: any[] = [];

  ngOnInit(): void {
    this.loadPendingVehicles();
  }

  loadPendingVehicles(): void {
    // Dans une vraie app, on filtrerait par statut 'EN_ATTENTE'
    this.pendingVehicles = [
      { id: 101, brand: 'Volkswagen', model: 'Golf 7', plate: '154 TN 2024', owner: 'Moncef Transport S.A.', status: 'En attente', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=150' },
      { id: 102, brand: 'Kia', model: 'Rio', plate: '202 TN 540', owner: 'Express Delivery', status: 'En attente', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=150' }
    ];
  }

  approveVehicle(id: number): void {
    this.pendingVehicles = this.pendingVehicles.filter(v => v.id !== id);
    alert('Véhicule approuvé avec succès !');
  }

  rejectVehicle(id: number): void {
    if (confirm('Voulez-vous vraiment rejeter ce véhicule ?')) {
      this.pendingVehicles = this.pendingVehicles.filter(v => v.id !== id);
    }
  }
}
