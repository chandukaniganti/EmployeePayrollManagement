

package com.payroll.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.payroll.entity.User;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setRole("EMPLOYEE");
        return userRepository.save(user);
    }

public User updateUserRole(Long userId, String newRole) {

    User existingUser = userRepository.findById(userId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("User not found with ID: " + userId));

    existingUser.setRole(newRole);

    return userRepository.save(existingUser);
}
}
