/**
 * Modèles de données pour le module Chauffeur GoRide.
 * Ces interfaces définissent la structure exacte attendue par le backend.
 */

export interface DriverProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  totalRides: number;
  memberSince: string;
  isOnline: boolean;
  licenseNumber: string;
  city: string;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: 'Berline' | 'SUV' | 'Van' | 'Économique';
  status: 'active' | 'maintenance' | 'inactive';
  image: string;
  insuranceExpiry: string;
  technicalControlExpiry: string;
  fuelType: string;
  mileage: number;
}

export type RideStatus = 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';

export interface Ride {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerPhone: string;
  passengerRating: number;
  from: string;
  to: string;
  distance: string;
  duration: string;
  date: string;
  time: string;
  amount: number;
  status: RideStatus;
  paymentMethod: 'cash' | 'card';
  notes?: string;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  from: string;
  to: string;
  distance: string;
  estimatedDuration: string;
  estimatedAmount: number;
  requestedAt: string;
  vehicleType: string;
  paymentMethod: 'cash' | 'card';
}

export interface Earning {
  id: string;
  rideId: string;
  date: string;
  passengerName: string;
  from: string;
  to: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  paymentMethod: 'cash' | 'card';
  tip: number;
}

export interface EarningStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  todayRides: number;
  weekRides: number;
  monthRides: number;
  averagePerRide: number;
  weeklyData: number[];
  weeklyLabels: string[];
}

export interface Review {
  id: number;
  passengerName: string;
  passengerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  rideId: string;
}
