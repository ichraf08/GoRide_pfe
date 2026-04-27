package com.pfeproject.GoRide.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un trajet proposé par un chauffeur.
 * Un chauffeur peut créer des trajets que les clients peuvent réserver.
 */
@Entity
@Table(name = "trips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String departure;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "available_seats", nullable = false)
    @Builder.Default
    private Integer availableSeats = 3;

    @Column(name = "price_per_seat", nullable = false)
    private Double pricePerSeat;

    @Column(length = 20)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, FULL, CANCELLED, COMPLETED

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Le chauffeur qui propose le trajet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnoreProperties({"roles", "password", "hasFleet", "enabled", "createdAt"})
    private UserEntity driver;

    // Le véhicule utilisé pour le trajet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @JsonIgnoreProperties({"owner", "driver"})
    private Vehicle vehicle;
}
