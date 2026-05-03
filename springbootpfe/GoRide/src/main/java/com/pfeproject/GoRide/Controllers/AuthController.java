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

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Contrôleur d'authentification — gère l'inscription et la connexion.
 * Toutes les routes sous /api/auth/ sont publiques (pas besoin de JWT).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class AuthController {
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

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

    @Autowired
    private com.pfeproject.GoRide.services.EmailService emailService;

    /**
     * POST /api/auth/login
     * Authentifie l'utilisateur et renvoie un token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("[LOGIN] Tentative de connexion pour l'email : {}", loginRequest.getEmail());

        try {
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

            logger.info("[LOGIN] Connexion réussie pour : {} | Roles: {}", loginRequest.getEmail(), roles);

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getFirstName(),
                    userDetails.getLastName(),
                    roles));

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            logger.warn("[LOGIN] Échec de connexion : Identifiants invalides pour {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Adresse e-mail ou mot de passe incorrect."));
        } catch (Exception e) {
            logger.error("[LOGIN] Erreur inattendue lors de la connexion pour {} : {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Une erreur technique est survenue."));
        }
    }

    /**
     * POST /api/auth/signup
     * Inscrit un nouvel utilisateur avec le rôle spécifié.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        logger.info("[REGISTRATION] Nouvelle requête d'inscription reçue pour l'email : {}", signupRequest.getEmail());

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

        // 5. Assigner les rôles
        Set<Role> roles = new HashSet<>();
        Set<String> requestedRoles = signupRequest.getRoles();

        for (String r : requestedRoles) {
            String roleName = r.toUpperCase();
            ERole eRole;
            switch (roleName) {
                case "DRIVER":
                    eRole = ERole.ROLE_DRIVER;
                    break;
                case "FLEET_OWNER":
                    eRole = ERole.ROLE_FLEET_OWNER;
                    break;
                case "COMPANY":
                    eRole = ERole.ROLE_COMPANY;
                    break;
                case "USER":
                    eRole = ERole.ROLE_USER;
                    break;
                default:
                    eRole = ERole.ROLE_CLIENT;
                    break;
            }

            Role role = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException(
                            "Erreur : Le rôle " + eRole + " n'existe pas en base de données."));
            roles.add(role);
        }
        
        user.setRoles(roles);

        // 6. Sauvegarder en BD
        try {
            userRepo.save(user);
            logger.info("[REGISTRATION] Utilisateur créé avec succès en base de données. ID: {}", user.getId());
        } catch (Exception e) {
            logger.error("[REGISTRATION] Erreur lors de la sauvegarde en base de données : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur lors de la création du compte : " + e.getMessage()));
        }

        // 7. Envoyer email de bienvenue (Asynchrone)
        try {
            logger.info("[REGISTRATION] Tentative d'envoi de l'email de bienvenue pour : {}", user.getEmail());
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } catch (Exception e) {
            logger.error("[REGISTRATION] Erreur (non-bloquante) lors de l'envoi de l'email : {}", e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Inscription réussie !"));
    }

    /**
     * POST /api/auth/add-role
     * Ajoute un nouveau rôle à l'utilisateur connecté.
     */
    @PostMapping("/add-role")
    public ResponseEntity<?> addRoleToUser(@Valid @RequestBody RoleRequest roleRequest) {
        // 1. Récupérer l'utilisateur connecté depuis le contexte de sécurité
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Erreur : Utilisateur non trouvé."));

        // 2. Déterminer le rôle à ajouter
        String requestedRole = roleRequest.getRole().toUpperCase();
        if (!requestedRole.startsWith("ROLE_")) {
            requestedRole = "ROLE_" + requestedRole;
        }

        ERole eRole = ERole.valueOf(requestedRole);
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Erreur : Le rôle " + eRole + " n'existe pas."));

        // 3. Ajouter le rôle s'il n'est pas déjà présent
        if (user.getRoles().contains(role)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("L'utilisateur possède déjà ce rôle."));
        }

        user.getRoles().add(role);
        userRepo.save(user);

        return ResponseEntity.ok(new MessageResponse("Rôle " + requestedRole + " ajouté avec succès !"));
    }

    /**
     * POST /api/auth/remove-role
     * Supprime un rôle de l'utilisateur connecté.
     */
    @PostMapping("/remove-role")
    public ResponseEntity<?> removeRoleFromUser(@Valid @RequestBody RoleRequest roleRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Erreur : Utilisateur non trouvé."));

        String requestedRole = roleRequest.getRole().toUpperCase();
        if (!requestedRole.startsWith("ROLE_")) {
            requestedRole = "ROLE_" + requestedRole;
        }

        ERole eRole = ERole.valueOf(requestedRole);
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Erreur : Le rôle " + eRole + " n'existe pas."));

        if (!user.getRoles().contains(role)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("L'utilisateur ne possède pas ce rôle."));
        }

        // Empêcher de supprimer son dernier rôle
        if (user.getRoles().size() <= 1) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Vous devez garder au moins un rôle actif."));
        }

        user.getRoles().remove(role);
        userRepo.save(user);

        return ResponseEntity.ok(new MessageResponse("Rôle " + requestedRole + " supprimé avec succès !"));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        logger.info("[AUTH] Demande de réinitialisation pour : {}", request.getEmail());
        
        try {
            UserEntity user = userRepo.findByEmail(request.getEmail().trim().toLowerCase())
                    .orElse(null);

            // Sécurité : ne pas révéler si l'email existe ou non (anti-enumeration)
            // On retourne toujours un message de succès
            if (user != null) {
                String token = UUID.randomUUID().toString();
                user.setResetToken(token);
                user.setResetTokenExpiration(LocalDateTime.now().plusMinutes(15));
                userRepo.save(user);
                emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
                logger.info("[AUTH] Token de reset généré et email envoyé pour : {}", user.getEmail());
            } else {
                logger.warn("[AUTH] Email non trouvé pour reset : {} (réponse neutre envoyée)", request.getEmail());
            }

            return ResponseEntity.ok(new MessageResponse(
                "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation sous peu."
            ));

        } catch (Exception e) {
            logger.error("[AUTH] Erreur lors de la demande de réinitialisation : {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Une erreur est survenue. Veuillez réessayer."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("[AUTH] Tentative de réinitialisation avec token");
        
        try {
            UserEntity user = userRepo.findByResetToken(request.getToken())
                    .orElseThrow(() -> new RuntimeException("Token invalide ou expiré."));

            if (user.getResetTokenExpiration().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Le lien de réinitialisation a expiré.");
            }

            user.setPassword(encoder.encode(request.getNewPassword()));
            user.setResetToken(null);
            user.setResetTokenExpiration(null);
            userRepo.save(user);

            logger.info("[AUTH] Mot de passe réinitialisé avec succès pour : {}", user.getEmail());
            return ResponseEntity.ok(new MessageResponse("Votre mot de passe a été réinitialisé avec succès."));
        } catch (Exception e) {
            logger.error("[AUTH] Erreur lors de la réinitialisation : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
