package com.pfeproject.GoRide.repositories;

import com.pfeproject.GoRide.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    // Tous les trajets d'un chauffeur
    List<Trip> findByDriverId(Long driverId);

    // Trajets disponibles (status AVAILABLE et départ dans le futur)
    @Query("SELECT t FROM Trip t WHERE t.status = 'AVAILABLE' AND t.departureTime > :now ORDER BY t.departureTime ASC")
    List<Trip> findAvailableTrips(LocalDateTime now);

    // Trajets par lieu de départ et destination
    List<Trip> findByDepartureContainingIgnoreCaseAndDestinationContainingIgnoreCase(
            String departure, String destination);
}
