import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../services/driver.service';
import { RideRequest } from '../../models/driver.models';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  requests: RideRequest[] = [];
  loading = true;
  processingId: string | null = null;
  successMessage: string | null = null;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.driverService.getRequests().subscribe(requests => {
      this.requests = requests;
      this.loading = false;
    });
  }

  acceptRequest(id: string): void {
    this.processingId = id;
    this.driverService.acceptRequest(id).subscribe({
      next: (ride) => {
        this.processingId = null;
        this.successMessage = `Course #${ride.id} acceptée ! ${ride.from} → ${ride.to}`;
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: () => {
        this.processingId = null;
      }
    });
  }

  declineRequest(id: string): void {
    this.processingId = id;
    this.driverService.declineRequest(id).subscribe(() => {
      this.processingId = null;
    });
  }
}
