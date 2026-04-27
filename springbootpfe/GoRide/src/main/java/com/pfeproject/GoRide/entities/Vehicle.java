package com.pfeproject.GoRide.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entité représentant un véhicule sur la plateforme GoRide.
 * Un véhicule appartient à un propriétaire de flotte et peut être assigné à un chauffeur.
 */
@Entity
@Table(name = "vehicles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(nullable = false)
    @Builder.Default
    private Integer seats = 4;

    @Column(name = "has_wifi")
    @Builder.Default
    private Boolean hasWifi = false;

    @Column(name = "has_baby_seat")
    @Builder.Default
    private Boolean hasBabySeat = false;

    @Column(name = "luggage_capacity")
    @Builder.Default
    private Integer luggageCapacity = 2;

    @Column(name = "fuel_type", length = 20)
    private String fuelType;

    @Builder.Default
    private Boolean available = true;

    // Le propriétaire du véhicule (Fleet Owner)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties({"roles", "password", "hasFleet", "enabled", "createdAt"})
    private UserEntity owner;

    // Le chauffeur actuellement assigné
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"roles", "password", "hasFleet", "enabled", "createdAt"})
    private UserEntity driver;
}
