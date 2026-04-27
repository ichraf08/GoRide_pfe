package com.pfeproject.GoRide.dto;

import jakarta.validation.constraints.*;

/**
 * DTO pour la requête d'inscription.
 * confirmPassword est validé ici (côté API) et n'est jamais stocké en BD.
 */
public class SignupRequest {

    private String firstName;

    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "La confirmation du mot de passe est obligatoire")
    private String confirmPassword;

    private String phone;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role; // CLIENT, DRIVER, FLEET_OWNER, COMPANY

    private String city;

    private Boolean hasFleet;

    public SignupRequest() {}

    // Getters & Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Boolean getHasFleet() { return hasFleet; }
    public void setHasFleet(Boolean hasFleet) { this.hasFleet = hasFleet; }
}
