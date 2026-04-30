package com.pfeproject.GoRide.services;

import com.pfeproject.GoRide.dto.TripDTO;
import com.pfeproject.GoRide.entities.Trip;
import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.entities.Vehicle;
import com.pfeproject.GoRide.repositories.TripRepository;
import com.pfeproject.GoRide.repositories.UserRepo;
import com.pfeproject.GoRide.repositories.VehicleRepository;
import com.pfeproject.GoRide.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service métier pour la gestion des trajets.
 */
@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Crée un nouveau trajet pour un chauffeur.
     */
    public Trip createTrip(Long driverId, TripDTO dto) {
        UserEntity driver = userRepo.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'id : " + driverId));

        Trip trip = Trip.builder()
                .departure(dto.getDeparture())
                .destination(dto.getDestination())
                .departureTime(dto.getDepartureTime())
                .availableSeats(dto.getAvailableSeats())
                .pricePerSeat(dto.getPricePerSeat())
                .notes(dto.getNotes())
                .status("AVAILABLE")
                .driver(driver)
                .build();

        // Associer un véhicule si fourni
        if (dto.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé avec l'id : " + dto.getVehicleId()));
            trip.setVehicle(vehicle);
        }

        Trip savedTrip = tripRepository.save(trip);

        // Notification pour le chauffeur (confirmation de création)
        notificationService.createNotification(
                driverId,
                "Trajet créé",
                "Votre trajet de " + trip.getDeparture() + " vers " + trip.getDestination() + " est maintenant en ligne.",
                "SUCCESS",
                "/driver/rides"
        );

        return savedTrip;
    }

    /**
     * Retourne tous les trajets disponibles (dans le futur).
     */
    public List<Trip> getAvailableTrips() {
        return tripRepository.findAvailableTrips(LocalDateTime.now());
    }

    /**
     * Retourne tous les trajets d'un chauffeur.
     */
    public List<Trip> getTripsByDriver(Long driverId) {
        return tripRepository.findByDriverId(driverId);
    }

    /**
     * Annule un trajet (uniquement par son chauffeur).
     */
    public void cancelTrip(Long tripId, Long driverId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé avec l'id : " + tripId));

        if (!trip.getDriver().getId().equals(driverId)) {
            throw new SecurityException("Vous n'êtes pas le chauffeur de ce trajet.");
        }

        trip.setStatus("CANCELLED");
        tripRepository.save(trip);

        // Notification pour le chauffeur
        notificationService.createNotification(
                driverId,
                "Trajet annulé",
                "Votre trajet vers " + trip.getDestination() + " a bien été annulé.",
                "DANGER",
                "/driver/rides"
        );
    }

    /**
     * Retourne un trajet par son ID.
     */
    public Trip getTripById(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé avec l'id : " + tripId));
    }
}
