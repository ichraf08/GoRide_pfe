import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../services/driver.service';
import { Ride, RideStatus } from '../../models/driver.models';

@Component({
  selector: 'app-rides',
  templateUrl: './rides.component.html',
  styleUrls: ['./rides.component.css']
})
export class RidesComponent implements OnInit {
  rides: Ride[] = [];
  filteredRides: Ride[] = [];
  activeFilter: string = 'all';
  loading = true;

  filterOptions = [
    { label: 'Toutes', value: 'all' },
    { label: 'Terminées', value: 'terminee' },
    { label: 'En cours', value: 'en_cours' },
    { label: 'Acceptées', value: 'acceptee' },
    { label: 'Annulées', value: 'annulee' }
  ];

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.driverService.getRides().subscribe(rides => {
      this.rides = rides;
      this.filteredRides = rides;
      this.loading = false;
    });
  }

  filterByStatus(status: string): void {
    this.activeFilter = status;
    if (status === 'all') {
      this.filteredRides = this.rides;
    } else {
      this.filteredRides = this.rides.filter(r => r.status === status);
    }
  }

  getStatusLabel(status: RideStatus): string {
    const map: Record<RideStatus, string> = {
      'en_attente': 'En attente',
      'acceptee': 'Acceptée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return map[status] || status;
  }

  getStatusClass(status: RideStatus): string {
    const map: Record<RideStatus, string> = {
      'en_attente': 'status-pending',
      'acceptee': 'status-accepted',
      'en_cours': 'status-active',
      'terminee': 'status-completed',
      'annulee': 'status-cancelled'
    };
    return map[status] || '';
  }

  get completedCount(): number {
    return this.rides.filter(r => r.status === 'terminee').length;
  }

  get totalEarnings(): number {
    return this.rides.filter(r => r.status === 'terminee').reduce((sum, r) => sum + r.amount, 0);
  }
}
