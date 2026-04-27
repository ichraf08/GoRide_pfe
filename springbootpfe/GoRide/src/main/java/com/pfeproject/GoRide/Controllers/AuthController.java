package com.pfeproject.GoRide.Controllers;

import com.pfeproject.GoRide.dto.*;
import com.pfeproject.GoRide.entities.*;
import com.pfeproject.GoRide.repositories.RoleRepository;
import com.pfeproject.GoRide.repositories.UserRepo;
import com.pfeproject.GoRide.security.UserDetailsImpl;
import com.pfeproject.GoRide.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Contrôleur d'authentification — gère l'inscription et la connexion.
 * Toutes les routes sous /api/auth/ sont publiques (pas besoin de JWT).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * POST /api/auth/login
     * Authentifie l'utilisateur et renvoie un token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles));
    }

    /**
     * POST /api/auth/signup
     * Inscrit un nouvel utilisateur avec le rôle spécifié.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {

        // 1. Vérifier que les mots de passe correspondent
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Les mots de passe ne correspondent pas."));
        }

        // 2. Vérifier que l'email n'est pas déjà utilisé
        if (userRepo.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cet email est déjà utilisé."));
        }

        // 3. Vérifier le téléphone (si fourni)
        if (signupRequest.getPhone() != null && !signupRequest.getPhone().isBlank()) {
            if (userRepo.existsByPhone(signupRequest.getPhone())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Ce numéro de téléphone est déjà utilisé."));
            }
        }

        // 4. Créer l'utilisateur avec le mot de passe hashé (BCrypt)
        UserEntity user = UserEntity.builder()
                .firstName(signupRequest.getFirstName())
                .lastName(signupRequest.getLastName())
                .email(signupRequest.getEmail())
                .password(encoder.encode(signupRequest.getPassword()))
                .phone(signupRequest.getPhone())
                .city(signupRequest.getCity())
                .hasFleet(signupRequest.getHasFleet())
                .build();

        // 5. Assigner le rôle
        Set<Role> roles = new HashSet<>();
        String requestedRole = signupRequest.getRole().toUpperCase();

        ERole eRole;
        switch (requestedRole) {
            case "DRIVER":
                eRole = ERole.ROLE_DRIVER;
                break;
            case "FLEET_OWNER":
                eRole = ERole.ROLE_FLEET_OWNER;
                break;
            case "COMPANY":
                eRole = ERole.ROLE_COMPANY;
                break;
            case "ADMIN":
                eRole = ERole.ROLE_ADMIN;
                break;
            default:
                eRole = ERole.ROLE_CLIENT;
                break;
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException(
                        "Erreur : Le rôle " + eRole + " n'existe pas en base de données. " +
                        "Veuillez exécuter le script d'initialisation des rôles."));

        roles.add(role);
        user.setRoles(roles);

        // 6. Sauvegarder en BD
        userRepo.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Inscription réussie ! Vous pouvez maintenant vous connecter."));
    }
}
