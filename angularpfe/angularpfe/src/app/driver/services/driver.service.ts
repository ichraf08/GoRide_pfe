import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';
import {
  DriverProfile, Vehicle, Ride, RideRequest, Earning,
  EarningStats, Review, RideStatus
} from '../models/driver.models';

/**
 * DriverService — Service central du module Chauffeur.
 *
 * Architecture :
 * - Utilise des BehaviorSubjects pour le state management réactif.
 * - Les méthodes retournent des Observable<T> pour simuler exactement
 *   le comportement d'un HttpClient.get/post/put.
 * - Pour brancher le vrai backend, il suffit de remplacer les `of(...)`
 *   par des `this.http.get<T>(...)` sans toucher aux composants.
 */
@Injectable({ providedIn: 'root' })
export class DriverService {

  // ═══════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════

  private profileSubject = new BehaviorSubject<DriverProfile>(this.getMockProfile());
  readonly profile$ = this.profileSubject.asObservable();

  private onlineSubject = new BehaviorSubject<boolean>(true);
  readonly isOnline$ = this.onlineSubject.asObservable();

  private ridesSubject = new BehaviorSubject<Ride[]>(this.getMockRides());
  readonly rides$ = this.ridesSubject.asObservable();

  private requestsSubject = new BehaviorSubject<RideRequest[]>(this.getMockRequests());
  readonly requests$ = this.requestsSubject.asObservable();

  // ═══════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════

  getProfile(): Observable<DriverProfile> {
    return this.profile$;
  }

  updateProfile(updates: Partial<DriverProfile>): Observable<DriverProfile> {
    const current = this.profileSubject.value;
    const updated = { ...current, ...updates };
    this.profileSubject.next(updated);
    return of(updated).pipe(delay(300));
  }

  // ═══════════════════════════════════════
  // AVAILABILITY
  // ═══════════════════════════════════════

  toggleOnlineStatus(): Observable<boolean> {
    const newStatus = !this.onlineSubject.value;
    this.onlineSubject.next(newStatus);
    return of(newStatus).pipe(delay(200));
  }

  // ═══════════════════════════════════════
  // RIDES
  // ═══════════════════════════════════════

  getRides(): Observable<Ride[]> {
    return this.rides$;
  }

  getRidesByStatus(status: RideStatus): Observable<Ride[]> {
    const filtered = this.ridesSubject.value.filter(r => r.status === status);
    return of(filtered);
  }

  getTodayRides(): Observable<Ride[]> {
    // Simulate filtering today's rides
    const today = this.ridesSubject.value.filter(r =>
      r.date.includes("Aujourd'hui") || r.date.includes('30/04/2026')
    );
    return of(today);
  }

  // ═══════════════════════════════════════
  // REQUESTS (Demandes entrantes)
  // ═══════════════════════════════════════

  getRequests(): Observable<RideRequest[]> {
    return this.requests$;
  }

  acceptRequest(requestId: string): Observable<Ride> {
    const requests = this.requestsSubject.value;
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');

    // Remove from requests
    this.requestsSubject.next(requests.filter(r => r.id !== requestId));

    // Create a new ride from the request
    const newRide: Ride = {
      id: 'GR-' + Math.floor(Math.random() * 10000),
      passengerName: request.passengerName,
      passengerAvatar: request.passengerAvatar,
      passengerPhone: '+216 55 123 456',
      passengerRating: request.passengerRating,
      from: request.from,
      to: request.to,
      distance: request.distance,
      duration: request.estimatedDuration,
      date: "Aujourd'hui",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      amount: request.estimatedAmount,
      status: 'acceptee',
      paymentMethod: request.paymentMethod,
    };

    // Add to rides
    const rides = this.ridesSubject.value;
    this.ridesSubject.next([newRide, ...rides]);

    return of(newRide).pipe(delay(400));
  }

  declineRequest(requestId: string): Observable<boolean> {
    const requests = this.requestsSubject.value;
    this.requestsSubject.next(requests.filter(r => r.id !== requestId));
    return of(true).pipe(delay(300));
  }

  // ═══════════════════════════════════════
  // VEHICLE
  // ═══════════════════════════════════════

  getVehicle(): Observable<Vehicle | null> {
    return of(this.getMockVehicle()).pipe(delay(300));
  }

  updateVehicle(updates: Partial<Vehicle>): Observable<Vehicle> {
    const current = this.getMockVehicle();
    const updated = { ...current, ...updates };
    return of(updated).pipe(delay(400));
  }

  // ═══════════════════════════════════════
  // EARNINGS
  // ═══════════════════════════════════════

  getEarnings(): Observable<Earning[]> {
    return of(this.getMockEarnings()).pipe(delay(300));
  }

  getEarningStats(): Observable<EarningStats> {
    return of(this.getMockEarningStats()).pipe(delay(300));
  }

  // ═══════════════════════════════════════
  // REVIEWS
  // ═══════════════════════════════════════

  getReviews(): Observable<Review[]> {
    return of(this.getMockReviews()).pipe(delay(300));
  }

  // ═══════════════════════════════════════
  // DASHBOARD STATS (aggregated)
  // ═══════════════════════════════════════

  getDashboardStats(): Observable<{
    todayEarnings: number;
    todayRides: number;
    rating: number;
    pendingRequests: number;
    onlineHours: string;
  }> {
    return of({
      todayEarnings: 145.00,
      todayRides: 12,
      rating: 4.9,
      pendingRequests: this.requestsSubject.value.length,
      onlineHours: '6h 30m'
    }).pipe(delay(200));
  }

  // ═══════════════════════════════════════
  // MOCK DATA — Replace with HttpClient calls
  // ═══════════════════════════════════════

  private getMockProfile(): DriverProfile {
    return {
      id: 1,
      firstName: 'Amine',
      lastName: 'Jebali',
      email: 'amine.jebali@goride.tn',
      phone: '+216 55 123 456',
      avatar: 'assets/images/person_1.jpg',
      rating: 4.9,
      totalRides: 347,
      memberSince: '2025-03-15',
      isOnline: true,
      licenseNumber: 'TN-2024-DRV-5521',
      city: 'Tunis'
    };
  }

  private getMockVehicle(): Vehicle {
    return {
      id: 1,
      brand: 'Peugeot',
      model: '308',
      year: 2023,
      color: 'Noir',
      plateNumber: '198 TU 7742',
      type: 'Berline',
      status: 'active',
      image: 'assets/images/car_goride.png',
      insuranceExpiry: '2026-12-31',
      technicalControlExpiry: '2026-09-15',
      fuelType: 'Essence',
      mileage: 34500
    };
  }

  private getMockRides(): Ride[] {
    return [
      {
        id: 'GR-8821', passengerName: 'Amine J.', passengerAvatar: 'assets/images/person_1.jpg',
        passengerPhone: '+216 55 111 222', passengerRating: 4.8,
        from: 'Lac 2, Tunis', to: 'Aéroport Tunis-Carthage', distance: '12.3 km', duration: '25 min',
        date: "Aujourd'hui", time: '14:30', amount: 15.50, status: 'terminee', paymentMethod: 'cash'
      },
      {
        id: 'GR-8819', passengerName: 'Sarra B.', passengerAvatar: 'assets/images/person_2.jpg',
        passengerPhone: '+216 55 333 444', passengerRating: 4.5,
        from: 'La Marsa', to: 'Sidi Bou Said', distance: '4.1 km', duration: '12 min',
        date: "Aujourd'hui", time: '12:15', amount: 8.00, status: 'terminee', paymentMethod: 'card'
      },
      {
        id: 'GR-8815', passengerName: 'Mohamed L.', passengerAvatar: 'assets/images/person_3.jpg',
        passengerPhone: '+216 55 555 666', passengerRating: 4.9,
        from: 'Ariana', to: 'Centre Ville Tunis', distance: '8.7 km', duration: '22 min',
        date: 'Hier', time: '18:45', amount: 22.00, status: 'terminee', paymentMethod: 'cash'
      },
      {
        id: 'GR-8810', passengerName: 'Fatma Z.', passengerAvatar: 'assets/images/person_4.jpg',
        passengerPhone: '+216 55 777 888', passengerRating: 4.7,
        from: 'Menzah 6', to: 'Lac 1', distance: '6.2 km', duration: '18 min',
        date: 'Hier', time: '10:00', amount: 11.50, status: 'terminee', paymentMethod: 'card'
      },
      {
        id: 'GR-8805', passengerName: 'Karim B.', passengerAvatar: 'assets/images/person_1.jpg',
        passengerPhone: '+216 55 999 000', passengerRating: 4.3,
        from: 'Ennasr', to: 'Bardo', distance: '9.5 km', duration: '30 min',
        date: '28/04/2026', time: '08:30', amount: 18.00, status: 'terminee', paymentMethod: 'cash'
      },
      {
        id: 'GR-8800', passengerName: 'Nadia S.', passengerAvatar: 'assets/images/person_2.jpg',
        passengerPhone: '+216 55 111 333', passengerRating: 5.0,
        from: 'Soukra', to: 'Manar 2', distance: '5.0 km', duration: '15 min',
        date: '27/04/2026', time: '16:00', amount: 9.00, status: 'annulee', paymentMethod: 'card',
        notes: 'Annulée par le passager'
      },
    ];
  }

  private getMockRequests(): RideRequest[] {
    return [
      {
        id: 'REQ-501', passengerName: 'Youssef M.', passengerAvatar: 'assets/images/person_3.jpg',
        passengerRating: 4.6, from: 'Manar 3, Tunis', to: 'Lac 2', distance: '7.8 km',
        estimatedDuration: '20 min', estimatedAmount: 12.50, requestedAt: 'Il y a 2 min',
        vehicleType: 'Berline', paymentMethod: 'cash'
      },
      {
        id: 'REQ-502', passengerName: 'Ines K.', passengerAvatar: 'assets/images/person_4.jpg',
        passengerRating: 4.9, from: 'Centre Ville', to: 'Aéroport', distance: '15.2 km',
        estimatedDuration: '35 min', estimatedAmount: 25.00, requestedAt: 'Il y a 5 min',
        vehicleType: 'Berline', paymentMethod: 'card'
      },
      {
        id: 'REQ-503', passengerName: 'Ali H.', passengerAvatar: 'assets/images/person_1.jpg',
        passengerRating: 4.2, from: 'Bardo', to: 'Ennasr', distance: '6.0 km',
        estimatedDuration: '18 min', estimatedAmount: 10.00, requestedAt: 'Il y a 8 min',
        vehicleType: 'Économique', paymentMethod: 'cash'
      }
    ];
  }

  private getMockEarnings(): Earning[] {
    return [
      { id: 'E-001', rideId: 'GR-8821', date: "Aujourd'hui", passengerName: 'Amine J.', from: 'Lac 2', to: 'Aéroport', grossAmount: 15.50, commission: 2.33, netAmount: 13.17, paymentMethod: 'cash', tip: 2.00 },
      { id: 'E-002', rideId: 'GR-8819', date: "Aujourd'hui", passengerName: 'Sarra B.', from: 'La Marsa', to: 'Sidi Bou Said', grossAmount: 8.00, commission: 1.20, netAmount: 6.80, paymentMethod: 'card', tip: 0 },
      { id: 'E-003', rideId: 'GR-8815', date: 'Hier', passengerName: 'Mohamed L.', from: 'Ariana', to: 'Centre Ville', grossAmount: 22.00, commission: 3.30, netAmount: 18.70, paymentMethod: 'cash', tip: 3.00 },
      { id: 'E-004', rideId: 'GR-8810', date: 'Hier', passengerName: 'Fatma Z.', from: 'Menzah 6', to: 'Lac 1', grossAmount: 11.50, commission: 1.73, netAmount: 9.77, paymentMethod: 'card', tip: 1.00 },
      { id: 'E-005', rideId: 'GR-8805', date: '28/04', passengerName: 'Karim B.', from: 'Ennasr', to: 'Bardo', grossAmount: 18.00, commission: 2.70, netAmount: 15.30, paymentMethod: 'cash', tip: 0 },
      { id: 'E-006', rideId: 'GR-8795', date: '27/04', passengerName: 'Lina T.', from: 'Soukra', to: 'Marsa', grossAmount: 14.00, commission: 2.10, netAmount: 11.90, paymentMethod: 'card', tip: 2.00 },
      { id: 'E-007', rideId: 'GR-8790', date: '26/04', passengerName: 'Omar F.', from: 'Menzah 9', to: 'Lac 2', grossAmount: 10.00, commission: 1.50, netAmount: 8.50, paymentMethod: 'cash', tip: 0 },
    ];
  }

  private getMockEarningStats(): EarningStats {
    return {
      todayEarnings: 145.00,
      weekEarnings: 687.50,
      monthEarnings: 2840.00,
      todayRides: 12,
      weekRides: 48,
      monthRides: 186,
      averagePerRide: 15.27,
      weeklyData: [65, 59, 80, 81, 56, 120, 145],
      weeklyLabels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    };
  }

  private getMockReviews(): Review[] {
    return [
      { id: 1, passengerName: 'Amine J.', passengerAvatar: 'assets/images/person_1.jpg', rating: 5, comment: 'Excellent chauffeur, très ponctuel et agréable. Véhicule propre.', date: "Aujourd'hui", rideId: 'GR-8821' },
      { id: 2, passengerName: 'Sarra B.', passengerAvatar: 'assets/images/person_2.jpg', rating: 5, comment: 'Trajet parfait, je recommande vivement !', date: 'Hier', rideId: 'GR-8819' },
      { id: 3, passengerName: 'Mohamed L.', passengerAvatar: 'assets/images/person_3.jpg', rating: 4, comment: 'Bon trajet, mais un peu de retard au départ.', date: '28/04/2026', rideId: 'GR-8815' },
      { id: 4, passengerName: 'Fatma Z.', passengerAvatar: 'assets/images/person_4.jpg', rating: 5, comment: 'Conduite douce et sûre. Merci !', date: '27/04/2026', rideId: 'GR-8810' },
      { id: 5, passengerName: 'Karim B.', passengerAvatar: 'assets/images/person_1.jpg', rating: 5, comment: 'Service impeccable comme toujours.', date: '26/04/2026', rideId: 'GR-8805' },
    ];
  }
}
