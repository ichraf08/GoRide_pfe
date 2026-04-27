package com.pfeproject.GoRide.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entité représentant un rôle utilisateur.
 * Stockée dans la table "roles" avec des valeurs prédéfinies (ERole).
 */
@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    @Enumerated(EnumType.STRING)
    private ERole name;
}
