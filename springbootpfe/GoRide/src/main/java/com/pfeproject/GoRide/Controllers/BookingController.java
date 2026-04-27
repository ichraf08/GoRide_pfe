package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.dto.BookingDTO;
import com.pfeproject.GoRide.dto.MessageResponse;
import com.pfeproject.GoRide.entities.Booking;
import com.pfeproject.GoRide.security.UserDetailsImpl;
import com.pfeproject.GoRide.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour la gestion des réservations.
 * Tous les endpoints nécessitent une authentification.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/bookings
     * Réserve des places sur un trajet pour l'utilisateur connecté.
     */
    @PostMapping
    public ResponseEntity<?> bookTrip(
            @Valid @RequestBody BookingDTO dto,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Booking booking = bookingService.book(userDetails.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/bookings/me
     * Retourne les réservations de l'utilisateur connecté.
     */
    @GetMapping("/me")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Booking> bookings = bookingService.getBookingsByUser(userDetails.getId());
        return ResponseEntity.ok(bookings);
    }

    /**
     * DELETE /api/bookings/{id}
     * Annule une réservation de l'utilisateur connecté.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            bookingService.cancelBooking(id, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Réservation annulée avec succès."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/bookings/trip/{tripId}
     * Retourne toutes les réservations d'un trajet (pour le chauffeur).
     */
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Booking>> getBookingsByTrip(@PathVariable Long tripId) {
        List<Booking> bookings = bookingService.getBookingsByTrip(tripId);
        return ResponseEntity.ok(bookings);
    }
}
