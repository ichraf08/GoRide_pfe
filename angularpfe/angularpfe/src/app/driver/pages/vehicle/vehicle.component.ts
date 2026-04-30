import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../services/driver.service';
import { Vehicle } from '../../models/driver.models';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})
export class VehicleComponent implements OnInit {
  vehicle: Vehicle | null = null;
  loading = true;
  isEditing = false;
  editForm: Partial<Vehicle> = {};
  saveSuccess = false;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.driverService.getVehicle().subscribe(v => {
      this.vehicle = v;
      this.loading = false;
    });
  }

  startEditing(): void {
    if (this.vehicle) {
      this.editForm = { ...this.vehicle };
      this.isEditing = true;
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editForm = {};
  }

  saveChanges(): void {
    this.driverService.updateVehicle(this.editForm).subscribe(updated => {
      this.vehicle = updated;
      this.isEditing = false;
      this.saveSuccess = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'active': 'Actif',
      'maintenance': 'En maintenance',
      'inactive': 'Inactif'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'active': 'status-active',
      'maintenance': 'status-maintenance',
      'inactive': 'status-inactive'
    };
    return map[status] || '';
  }

  getDaysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}
