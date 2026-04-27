package com.pfeproject.GoRide.repositories;

import com.pfeproject.GoRide.entities.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Réservations d'un passager
    List<Booking> findByPassengerId(Long passengerId);

    // Réservations pour un trajet
    List<Booking> findByTripId(Long tripId);

    // Vérifier si un passager a déjà réservé un trajet
    boolean existsByTripIdAndPassengerId(Long tripId, Long passengerId);
}
