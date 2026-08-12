package com.petzoe.api.service;

import com.petzoe.api.dto.AdminUserDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {
    
    private final UserRepository userRepository;
    
    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserDTO::new)
                .collect(Collectors.toList());
    }
    
    public AdminUserDTO toggleUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent disabling the main admin
        if ("Admin".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Cannot modify admin status");
        }
        
        user.setEnabled(enabled);
        return new AdminUserDTO(userRepository.save(user));
    }
}
