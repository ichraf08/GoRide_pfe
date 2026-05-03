package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Contrôleur de test pour valider la configuration des emails.
 * Accessible uniquement en développement.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        try {
            emailService.sendWelcomeEmail(to, "Utilisateur de Test");
            return ResponseEntity.ok(Map.of(
                "message", "Requête d'envoi d'email envoyée à " + to,
                "note", "Vérifiez vos logs backend pour confirmer le succès réel (asynchrone)."
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
