package com.pfeproject.GoRide.security;

import com.pfeproject.GoRide.security.jwt.JwtAuthEntryPoint;
import com.pfeproject.GoRide.security.jwt.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration globale de la sécurité Spring.
 * - CORS pour Angular (port 4200)
 * - JWT stateless (pas de session serveur)
 * - Routes publiques vs protégées par rôle
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Active @PreAuthorize sur les méthodes
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthEntryPoint unauthorizedHandler;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS : autorise Angular (localhost:4200)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Désactive CSRF (inutile avec JWT stateless)
                .csrf(csrf -> csrf.disable())
                // Gestion des erreurs 401
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
                // Pas de session serveur (JWT = stateless)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Règles d'autorisation des routes
                .authorizeHttpRequests(auth -> auth
                        // Routes publiques (inscription + connexion)
                        .requestMatchers("/api/auth/**").permitAll()
                        // Consultation des trajets disponibles — public (GET seulement)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/trips", "/api/trips/**").permitAll()
                        // Routes réservées aux chauffeurs
                        .requestMatchers("/api/driver/**").hasRole("DRIVER")
                        // Routes réservées aux propriétaires de flotte
                        .requestMatchers("/api/fleet/**").hasRole("FLEET_OWNER")
                        // Routes réservées aux entreprises
                        .requestMatchers("/api/company/**").hasRole("COMPANY")
                        // Routes admin
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Réservations : tout utilisateur authentifié
                        .requestMatchers("/api/bookings/**").authenticated()
                        // Toutes les autres requêtes nécessitent une authentification
                        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuration CORS : autorise le frontend Angular à communiquer avec le
     * backend.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
