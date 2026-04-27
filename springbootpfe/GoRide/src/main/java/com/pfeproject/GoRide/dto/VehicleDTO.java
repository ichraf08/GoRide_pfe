package com.pfeproject.GoRide.dto;

import jakarta.validation.constraints.*;

/**
 * DTO pour l'ajout ou la mise à jour d'un véhicule de flotte.
 */
public class VehicleDTO {

    @NotBlank(message = "La marque est obligatoire")
    private String brand;

    @NotBlank(message = "Le modèle est obligatoire")
    private String model;

    @NotBlank(message = "La plaque d'immatriculation est obligatoire")
    private String licensePlate;

    @Min(value = 1, message = "Le nombre de places doit être au moins 1")
    private Integer seats = 4;

    private Boolean hasWifi = false;
    private Boolean hasBabySeat = false;
    private Integer luggageCapacity = 2;
    private String fuelType;
    private String color;
    private Integer year;
    private String category; // STANDARD, CONFORT, BUSINESS, XL
    private Long driverId; // optionnel : assigner un chauffeur

    public VehicleDTO() {}

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public Boolean getHasWifi() { return hasWifi; }
    public void setHasWifi(Boolean hasWifi) { this.hasWifi = hasWifi; }

    public Boolean getHasBabySeat() { return hasBabySeat; }
    public void setHasBabySeat(Boolean hasBabySeat) { this.hasBabySeat = hasBabySeat; }

    public Integer getLuggageCapacity() { return luggageCapacity; }
    public void setLuggageCapacity(Integer luggageCapacity) { this.luggageCapacity = luggageCapacity; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
}
