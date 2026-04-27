package com.pfeproject.GoRide.services;

import com.pfeproject.GoRide.dto.VehicleDTO;
import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.entities.Vehicle;
import com.pfeproject.GoRide.repositories.UserRepo;
import com.pfeproject.GoRide.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service métier pour la gestion de la flotte de véhicules.
 * Réservé aux utilisateurs avec le rôle FLEET_OWNER.
 */
@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepo userRepo;

    /**
     * Ajoute un véhicule pour un propriétaire de flotte.
     * @param ownerId ID du propriétaire (Fleet Owner)
     * @param dto données du véhicule depuis le formulaire Angular
     */
    public Vehicle addVehicle(Long ownerId, VehicleDTO dto) {
        // Vérifier que la plaque n'existe pas déjà
        if (vehicleRepository.existsByLicensePlate(dto.getLicensePlate())) {
            throw new RuntimeException("Un véhicule avec cette plaque existe déjà : " + dto.getLicensePlate());
        }

        UserEntity owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé avec l'id : " + ownerId));

        Vehicle vehicle = Vehicle.builder()
                .brand(dto.getBrand())
                .model(dto.getModel())
                .licensePlate(dto.getLicensePlate().toUpperCase())
                .seats(dto.getSeats() != null ? dto.getSeats() : 4)
                .hasWifi(dto.getHasWifi() != null ? dto.getHasWifi() : false)
                .hasBabySeat(dto.getHasBabySeat() != null ? dto.getHasBabySeat() : false)
                .luggageCapacity(dto.getLuggageCapacity() != null ? dto.getLuggageCapacity() : 2)
                .fuelType(dto.getFuelType())
                .available(true)
                .owner(owner)
                .build();

        // Assigner un chauffeur si fourni
        if (dto.getDriverId() != null) {
            UserEntity driver = userRepo.findById(dto.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'id : " + dto.getDriverId()));
            vehicle.setDriver(driver);
        }

        return vehicleRepository.save(vehicle);
    }

    /**
     * Retourne tous les véhicules d'un propriétaire de flotte.
     */
    public List<Vehicle> getFleetByOwner(Long ownerId) {
        return vehicleRepository.findByOwnerId(ownerId);
    }

    /**
     * Supprime un véhicule (vérifie que l'appelant en est bien le propriétaire).
     */
    public void deleteVehicle(Long vehicleId, Long ownerId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé avec l'id : " + vehicleId));

        if (!vehicle.getOwner().getId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas le propriétaire de ce véhicule.");
        }

        vehicleRepository.delete(vehicle);
    }

    /**
     * Assigne un chauffeur à un véhicule.
     */
    public Vehicle assignDriver(Long vehicleId, Long driverId, Long ownerId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé avec l'id : " + vehicleId));

        if (!vehicle.getOwner().getId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas le propriétaire de ce véhicule.");
        }

        UserEntity driver = userRepo.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'id : " + driverId));

        vehicle.setDriver(driver);
        return vehicleRepository.save(vehicle);
    }

    /**
     * Retourne tous les véhicules disponibles.
     */
    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByAvailableTrue();
    }
}
