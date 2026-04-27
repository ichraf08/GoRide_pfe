package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.dto.MessageResponse;
import com.pfeproject.GoRide.dto.VehicleDTO;
import com.pfeproject.GoRide.entities.Vehicle;
import com.pfeproject.GoRide.security.UserDetailsImpl;
import com.pfeproject.GoRide.services.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur pour la gestion de la flotte de véhicules.
 * Toutes les routes nécessitent le rôle FLEET_OWNER sauf GET /available.
 */
@RestController
@RequestMapping("/api/fleet")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    /**
     * POST /api/fleet/vehicles
     * Ajoute un véhicule à la flotte du Fleet Owner connecté.
     * Utilisé par le FleetSetupComponent Angular.
     */
    @PostMapping("/vehicles")
    @PreAuthorize("hasRole('FLEET_OWNER')")
    public ResponseEntity<?> addVehicle(
            @Valid @RequestBody VehicleDTO dto,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Vehicle vehicle = vehicleService.addVehicle(userDetails.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/fleet/vehicles
     * Retourne la liste des véhicules du Fleet Owner connecté.
     */
    @GetMapping("/vehicles")
    @PreAuthorize("hasRole('FLEET_OWNER')")
    public ResponseEntity<List<Vehicle>> getMyFleet(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Vehicle> fleet = vehicleService.getFleetByOwner(userDetails.getId());
        return ResponseEntity.ok(fleet);
    }

    /**
     * DELETE /api/fleet/vehicles/{id}
     * Supprime un véhicule de la flotte.
     */
    @DeleteMapping("/vehicles/{id}")
    @PreAuthorize("hasRole('FLEET_OWNER')")
    public ResponseEntity<?> deleteVehicle(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            vehicleService.deleteVehicle(id, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Véhicule supprimé avec succès."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * PATCH /api/fleet/vehicles/{id}/assign-driver
     * Assigne un chauffeur à un véhicule.
     * Body: { "driverId": 5 }
     */
    @PatchMapping("/vehicles/{id}/assign-driver")
    @PreAuthorize("hasRole('FLEET_OWNER')")
    public ResponseEntity<?> assignDriver(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long driverId = body.get("driverId");
            if (driverId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("driverId est requis."));
            }
            Vehicle vehicle = vehicleService.assignDriver(id, driverId, userDetails.getId());
            return ResponseEntity.ok(vehicle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/fleet/vehicles/available
     * Retourne tous les véhicules disponibles (accès authentifié).
     */
    @GetMapping("/vehicles/available")
    public ResponseEntity<List<Vehicle>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }
}
