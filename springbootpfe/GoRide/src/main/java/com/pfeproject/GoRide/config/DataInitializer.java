package com.pfeproject.GoRide.config;

import com.pfeproject.GoRide.entities.ERole;
import com.pfeproject.GoRide.entities.Role;
import com.pfeproject.GoRide.repositories.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Initialise les rôles en base de données au démarrage de l'application.
 * Si les rôles existent déjà, ils ne seront pas recréés.
 */
@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, 
                                 com.pfeproject.GoRide.repositories.UserRepo userRepo,
                                 com.pfeproject.GoRide.repositories.TransactionRepository transactionRepo,
                                 com.pfeproject.GoRide.repositories.ActivityRepository activityRepo) {
        return args -> {
            // Init Roles
            for (ERole eRole : ERole.values()) {
                if (!roleRepository.existsByName(eRole)) {
                    roleRepository.save(Role.builder().name(eRole).build());
                    logger.info("✅ Rôle créé : {}", eRole.name());
                }
            }

            // Seed Test User if DB empty
            if (userRepo.count() == 0) {
                com.pfeproject.GoRide.entities.UserEntity user = com.pfeproject.GoRide.entities.UserEntity.builder()
                        .firstName("Ichraf")
                        .lastName("PFE")
                        .email("test@goride.com")
                        .password("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHGC2") // "password"
                        .phone("21699000111")
                        .walletBalance(1250.75)
                        .loyaltyPoints(12500)
                        .loyaltyTier("Gold")
                        .verificationStatus("VERIFIED")
                        .profileCompletion(85)
                        .enabled(true)
                        .build();
                
                userRepo.save(user);
                logger.info("👤 Utilisateur de test créé : test@goride.com");

                // Seed Transactions
                transactionRepo.save(com.pfeproject.GoRide.entities.Transaction.builder()
                        .title("Recharge Wallet D17")
                        .type("RECHARGE")
                        .amount(50.0)
                        .status("COMPLETED")
                        .transactionId("TRX-123456")
                        .user(user)
                        .build());

                transactionRepo.save(com.pfeproject.GoRide.entities.Transaction.builder()
                        .title("Trajet GoRide — Tunis Centre")
                        .type("TRIP")
                        .amount(-12.50)
                        .status("COMPLETED")
                        .transactionId("TRX-789012")
                        .user(user)
                        .build());

                // Seed Activities
                activityRepo.save(com.pfeproject.GoRide.entities.Activity.builder()
                        .title("Connexion détectée")
                        .description("Nouvelle connexion depuis Tunis, TN")
                        .type("SECURITY")
                        .category("info")
                        .user(user)
                        .build());

                activityRepo.save(com.pfeproject.GoRide.entities.Activity.builder()
                        .title("Trajet terminé")
                        .description("Vous avez terminé un trajet de 15km")
                        .type("TRIP")
                        .category("success")
                        .user(user)
                        .build());
            }

            logger.info("🚗 GoRide — Initialisation de la base de données terminée.");
        };
    }
}
