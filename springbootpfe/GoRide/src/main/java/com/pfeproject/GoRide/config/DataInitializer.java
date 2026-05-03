package com.pfeproject.GoRide.config;

import com.pfeproject.GoRide.entities.ERole;
import com.pfeproject.GoRide.entities.Role;
import com.pfeproject.GoRide.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Initialise les données nécessaires au démarrage de l'application.
 * Crée les rôles par défaut s'ils n'existent pas en base de données.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        Arrays.stream(ERole.values()).forEach(roleName -> {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(new Role(null, roleName));
                System.out.println("Rôle créé : " + roleName);
            }
        });
    }
}
