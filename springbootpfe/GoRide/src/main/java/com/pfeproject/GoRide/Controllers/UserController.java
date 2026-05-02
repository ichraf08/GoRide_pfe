package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.security.UserDetailsImpl;
import com.pfeproject.GoRide.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour les opérations sur les utilisateurs authentifiés.
 * Toutes les routes nécessitent un token JWT valide.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * GET /api/users/me
     * Retourne les informations de l'utilisateur connecté.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UserEntity user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(user);
    }

    /**
     * PATCH /api/users/me
     * Met à jour le profil de l'utilisateur connecté.
     */
    @PatchMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication,
                                                @RequestBody UserEntity updatedData) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UserEntity updated = userService.updateProfile(userDetails.getId(), updatedData);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/users/me/transactions
     * Retourne l'historique des transactions de l'utilisateur connecté.
     */
    @GetMapping("/me/transactions")
    public ResponseEntity<?> getMyTransactions(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserTransactions(userDetails.getId()));
    }

    /**
     * GET /api/users/me/activities
     * Retourne l'historique des activités de l'utilisateur connecté.
     */
    @GetMapping("/me/activities")
    public ResponseEntity<?> getMyActivities(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserActivities(userDetails.getId()));
    }

    /**
     * DELETE /api/admin/users/{id}
     * Supprime un utilisateur (Admin uniquement).
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().body("Utilisateur supprimé avec succès.");
    }
}
