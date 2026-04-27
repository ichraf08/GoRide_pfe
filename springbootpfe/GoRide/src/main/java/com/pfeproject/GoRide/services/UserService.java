package com.pfeproject.GoRide.services;

import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service métier pour la gestion des utilisateurs.
 */
@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    public Optional<UserEntity> findById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<UserEntity> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public UserEntity updateProfile(Long id, UserEntity updatedData) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));

        if (updatedData.getFirstName() != null) user.setFirstName(updatedData.getFirstName());
        if (updatedData.getLastName() != null) user.setLastName(updatedData.getLastName());
        if (updatedData.getPhone() != null) user.setPhone(updatedData.getPhone());

        return userRepo.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRepo.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé avec l'id : " + id);
        }
        userRepo.deleteById(id);
    }
}
