import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import * as L from 'leaflet';
import { DriverService } from '../../services/driver.service';
import { Ride, RideRequest, DriverProfile } from '../../models/driver.models';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  profile: DriverProfile | null = null;
  recentRides: Ride[] = [];
  pendingRequests: RideRequest[] = [];
  stats = { todayEarnings: 0, todayRides: 0, rating: 0, pendingRequests: 0, onlineHours: '0h' };
  
  isOnline: boolean = false;
  incomingRide: any = null;

  // Chart Configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };
  public lineChartType: any = 'line';

  private map: L.Map | undefined;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    // Load profile
    this.driverService.getProfile().subscribe(p => this.profile = p);

    // Load dashboard stats
    this.driverService.getDashboardStats().subscribe(s => this.stats = s);

    // Load recent rides
    this.driverService.getRides().subscribe(rides => this.recentRides = rides.slice(0, 4));

    // Load pending requests
    this.driverService.getRequests().subscribe(req => this.pendingRequests = req);

    // Load chart data from earnings
    this.driverService.getEarningStats().subscribe(es => {
      this.lineChartData = {
        labels: es.weeklyLabels,
        datasets: [{
          data: es.weeklyData,
          label: 'Revenus (DT)',
          fill: true,
          tension: 0.4,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#ffffff'
        }]
      };
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 300);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'en_attente': 'En attente', 'acceptee': 'Acceptée',
      'en_cours': 'En cours', 'terminee': 'Terminée', 'annulee': 'Annulée'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'en_attente': 'status-en-attente', 'acceptee': 'status-en-cours',
      'en_cours': 'status-en-cours', 'terminee': 'status-terminé', 'annulee': 'status-annulé'
    };
    return map[status] || '';
  }

  toggleOnline(): void {
    this.isOnline = !this.isOnline;
    if (this.isOnline) {
      // Simuler une demande après 5 secondes
      setTimeout(() => {
        if (this.isOnline) this.simulateRideRequest();
      }, 5000);
    } else {
      this.incomingRide = null;
    }
  }

  simulateRideRequest(): void {
    this.incomingRide = {
      id: Math.floor(Math.random() * 1000),
      client: 'Sami B.',
      from: 'Lac 1',
      to: 'Centre Urbain Nord',
      price: 14.5,
      distance: '6.2 km'
    };
  }

  acceptRide(): void {
    alert('Course acceptée ! Naviguez vers le point de départ.');
    this.incomingRide = null;
    this.stats.todayRides++;
    this.stats.todayEarnings += 14.5;
  }

  rejectRide(): void {
    this.incomingRide = null;
    // Relancer une simulation plus tard
    setTimeout(() => {
      if (this.isOnline) this.simulateRideRequest();
    }, 10000);
  }

  private initMap(): void {
    // ... rest of the code ...
    const mapContainer = document.getElementById('driver-map');
    if (!mapContainer) return;

    this.map = L.map('driver-map', {
      center: [36.8065, 10.1815],
      zoom: 13,
      zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OSM contributors &copy; CARTO'
    }).addTo(this.map);

    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='background-color:#10b981;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.3);'></div>",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([36.8065, 10.1815], { icon: driverIcon }).addTo(this.map);
  }
}
