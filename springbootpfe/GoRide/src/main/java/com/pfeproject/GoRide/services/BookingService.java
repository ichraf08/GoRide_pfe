package com.pfeproject.GoRide.services;

import com.pfeproject.GoRide.dto.BookingDTO;
import com.pfeproject.GoRide.entities.Booking;
import com.pfeproject.GoRide.entities.Trip;
import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.repositories.BookingRepository;
import com.pfeproject.GoRide.repositories.TripRepository;
import com.pfeproject.GoRide.repositories.UserRepo;
import com.pfeproject.GoRide.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service métier pour la gestion des réservations.
 */
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationService notificationService;

    /**
     * Réserve des places sur un trajet pour un passager.
     */
    @Transactional
    public Booking book(Long passengerId, BookingDTO dto) {
        // Vérifier qu'il n'a pas déjà réservé ce trajet
        if (bookingRepository.existsByTripIdAndPassengerId(dto.getTripId(), passengerId)) {
            throw new RuntimeException("Vous avez déjà réservé ce trajet.");
        }

        Trip trip = tripRepository.findById(dto.getTripId())
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé avec l'id : " + dto.getTripId()));

        if (!"AVAILABLE".equals(trip.getStatus())) {
            throw new RuntimeException("Ce trajet n'est plus disponible.");
        }

        int seats = dto.getSeatsBooked() != null ? dto.getSeatsBooked() : 1;

        if (trip.getAvailableSeats() < seats) {
            throw new RuntimeException("Pas assez de places disponibles. Places restantes : " + trip.getAvailableSeats());
        }

        UserEntity passenger = userRepo.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passager non trouvé avec l'id : " + passengerId));

        // Calculer le prix total
        double totalPrice = trip.getPricePerSeat() * seats;

        // Créer la réservation
        Booking booking = Booking.builder()
                .trip(trip)
                .passenger(passenger)
                .seatsBooked(seats)
                .totalPrice(totalPrice)
                .status("CONFIRMED")
                .build();

        // Mettre à jour les places disponibles
        trip.setAvailableSeats(trip.getAvailableSeats() - seats);
        if (trip.getAvailableSeats() == 0) {
            trip.setStatus("FULL");
        }
        tripRepository.save(trip);

        Booking savedBooking = bookingRepository.save(booking);

        // --- Notifications ---
        // 1. Pour le passager
        notificationService.createNotification(
                passengerId,
                "Réservation confirmée",
                "Votre réservation pour le trajet " + trip.getDeparture() + " -> " + trip.getDestination() + " a été acceptée.",
                "SUCCESS",
                "/acceuil/trajets"
        );

        // 2. Pour le chauffeur
        notificationService.createNotification(
                trip.getDriver().getId(),
                "Nouvelle réservation",
                passenger.getFirstName() + " a réservé " + seats + " place(s) sur votre trajet.",
                "INFO",
                "/driver/rides"
        );

        return savedBooking;
    }

    /**
     * Annule une réservation (par le passager).
     */
    @Transactional
    public void cancelBooking(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée avec l'id : " + bookingId));

        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new SecurityException("Vous n'êtes pas le propriétaire de cette réservation.");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Cette réservation est déjà annulée.");
        }

        // Remettre les places disponibles sur le trajet
        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + booking.getSeatsBooked());
        if ("FULL".equals(trip.getStatus())) {
            trip.setStatus("AVAILABLE");
        }
        tripRepository.save(trip);

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // --- Notification pour le chauffeur ---
        notificationService.createNotification(
                trip.getDriver().getId(),
                "Réservation annulée",
                booking.getPassenger().getFirstName() + " a annulé sa réservation pour votre trajet vers " + trip.getDestination() + ".",
                "WARNING",
                "/driver/rides"
        );
    }

    /**
     * Retourne toutes les réservations d'un passager.
     */
    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByPassengerId(userId);
    }

    /**
     * Retourne toutes les réservations d'un trajet.
     */
    public List<Booking> getBookingsByTrip(Long tripId) {
        return bookingRepository.findByTripId(tripId);
    }
}
