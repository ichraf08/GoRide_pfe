package com.pfeproject.GoRide.services;

import com.pfeproject.GoRide.entities.Activity;
import com.pfeproject.GoRide.entities.Transaction;
import com.pfeproject.GoRide.entities.UserEntity;
import com.pfeproject.GoRide.repositories.ActivityRepository;
import com.pfeproject.GoRide.repositories.TransactionRepository;
import com.pfeproject.GoRide.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service métier pour la gestion des utilisateurs.
 */
@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ActivityRepository activityRepository;

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

    public List<Transaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Activity> getUserActivities(Long userId) {
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
