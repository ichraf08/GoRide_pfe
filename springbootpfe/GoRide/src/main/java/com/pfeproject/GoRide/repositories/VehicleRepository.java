package com.pfeproject.GoRide.repositories;

import com.pfeproject.GoRide.entities.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByOwnerId(Long ownerId);
    List<Vehicle> findByDriverId(Long driverId);
    List<Vehicle> findByAvailableTrue();
    boolean existsByLicensePlate(String licensePlate);
}
