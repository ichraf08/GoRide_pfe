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
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            for (ERole eRole : ERole.values()) {
                if (!roleRepository.existsByName(eRole)) {
                    roleRepository.save(Role.builder().name(eRole).build());
                    logger.info("✅ Rôle créé : {}", eRole.name());
                }
            }
            logger.info("🚗 GoRide — Initialisation des rôles terminée.");
        };
    }
}
