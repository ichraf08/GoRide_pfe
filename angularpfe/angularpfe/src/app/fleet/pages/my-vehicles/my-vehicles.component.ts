import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-vehicles',
  templateUrl: './my-vehicles.component.html',
  styleUrls: ['./my-vehicles.component.css']
})
export class MyVehiclesComponent implements OnInit {
  vehicles: any[] = [];

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    const data = localStorage.getItem('goride_vehicles');
    if (data) {
      this.vehicles = JSON.parse(data);
    } else {
      this.vehicles = [
        { id: 1, brand: 'Volkswagen', model: 'Golf 7', plate: '202 TN 540', status: 'En service', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=300' },
        { id: 2, brand: 'Kia', model: 'Rio', plate: '185 TN 9920', status: 'Disponible', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=300' }
      ];
      localStorage.setItem('goride_vehicles', JSON.stringify(this.vehicles));
    }
  }

  deleteVehicle(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      this.vehicles = this.vehicles.filter(v => v.id !== id);
      localStorage.setItem('goride_vehicles', JSON.stringify(this.vehicles));
    }
  }
}
