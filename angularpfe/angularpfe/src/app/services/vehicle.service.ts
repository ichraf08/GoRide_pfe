import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO correspondant au VehicleDTO backend
export interface VehicleDTO {
  brand: string;
  model: string;
  licensePlate: string;
  seats?: number;
  hasWifi?: boolean;
  hasBabySeat?: boolean;
  luggageCapacity?: number;
  fuelType?: string;
  color?: string;
  year?: number;
  category?: string;
  driverId?: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  seats: number;
  hasWifi: boolean;
  hasBabySeat: boolean;
  luggageCapacity: number;
  fuelType: string;
  available: boolean;
}

const API_URL = 'http://localhost:8081/api/fleet/';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  constructor(private http: HttpClient) {}

  /**
   * Ajoute un véhicule à la flotte du Fleet Owner connecté.
   * Le JWT est ajouté automatiquement par le JwtInterceptor.
   */
  addVehicle(dto: VehicleDTO): Observable<Vehicle> {
    return this.http.post<Vehicle>(API_URL + 'vehicles', dto);
  }

  /**
   * Retourne la liste des véhicules du Fleet Owner connecté.
   */
  getMyFleet(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(API_URL + 'vehicles');
  }

  /**
   * Supprime un véhicule de la flotte.
   */
  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(API_URL + `vehicles/${id}`);
  }

  /**
   * Assigne un chauffeur à un véhicule.
   */
  assignDriver(vehicleId: number, driverId: number): Observable<Vehicle> {
    return this.http.patch<Vehicle>(API_URL + `vehicles/${vehicleId}/assign-driver`, { driverId });
  }

  /**
   * Retourne tous les véhicules disponibles (pas besoin de rôle).
   */
  getAvailableVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(API_URL + 'vehicles/available');
  }
}
