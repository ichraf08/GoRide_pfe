import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-vehicle',
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.css']
})
export class AddVehicleComponent implements OnInit {
  vehicle = {
    brand: '',
    model: '',
    plate: '',
    year: '',
    type: 'Économique'
  };
  isSubmitting = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.isSubmitting = true;
    
    // Simulation de sauvegarde
    setTimeout(() => {
      const newVehicle = {
        id: Date.now(),
        brand: this.vehicle.brand,
        model: this.vehicle.model,
        plate: this.vehicle.plate,
        status: 'Disponible',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=300'
      };

      const existing = JSON.parse(localStorage.getItem('goride_vehicles') || '[]');
      existing.unshift(newVehicle);
      localStorage.setItem('goride_vehicles', JSON.stringify(existing));

      this.isSubmitting = false;
      this.router.navigate(['/fleet/vehicles']);
    }, 1500);
  }
}
