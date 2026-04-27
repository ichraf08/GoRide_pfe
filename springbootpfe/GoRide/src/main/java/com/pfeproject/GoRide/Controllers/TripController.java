package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.dto.MessageResponse;
import com.pfeproject.GoRide.dto.TripDTO;
import com.pfeproject.GoRide.entities.Trip;
import com.pfeproject.GoRide.security.UserDetailsImpl;
import com.pfeproject.GoRide.services.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour la gestion des trajets.
 * - Création/annulation : DRIVER uniquement
 * - Consultation des trajets disponibles : tout utilisateur authentifié
 */
@RestController
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class TripController {

    @Autowired
    private TripService tripService;

    /**
     * POST /api/driver/trips
     * Crée un nouveau trajet (chauffeur connecté).
     */
    @PostMapping("/api/driver/trips")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> createTrip(
            @Valid @RequestBody TripDTO dto,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Trip trip = tripService.createTrip(userDetails.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/driver/trips
     * Retourne les trajets du chauffeur connecté.
     */
    @GetMapping("/api/driver/trips")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Trip>> getMyTrips(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Trip> trips = tripService.getTripsByDriver(userDetails.getId());
        return ResponseEntity.ok(trips);
    }

    /**
     * DELETE /api/driver/trips/{id}
     * Annule un trajet (chauffeur propriétaire uniquement).
     */
    @DeleteMapping("/api/driver/trips/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> cancelTrip(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            tripService.cancelTrip(id, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Trajet annulé avec succès."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/trips
     * Retourne tous les trajets disponibles (pour les clients).
     */
    @GetMapping("/api/trips")
    public ResponseEntity<List<Trip>> getAvailableTrips() {
        List<Trip> trips = tripService.getAvailableTrips();
        return ResponseEntity.ok(trips);
    }

    /**
     * GET /api/trips/{id}
     * Retourne un trajet par son ID.
     */
    @GetMapping("/api/trips/{id}")
    public ResponseEntity<?> getTripById(@PathVariable Long id) {
        try {
            Trip trip = tripService.getTripById(id);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
