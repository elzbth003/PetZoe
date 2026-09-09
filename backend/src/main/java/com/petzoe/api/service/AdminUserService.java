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
    
    public AdminUserDTO toggleUserStatus(Long userId, boolean enabled, String currentAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalArgumentException("You cannot deactivate your own account.");
        }

        // Prevent disabling the main admin or any admin
        if ("Admin".equalsIgnoreCase(user.getRole()) && !enabled) {
            throw new IllegalArgumentException("Administrator accounts cannot be deactivated.");
        }
        
        user.setEnabled(enabled);
        return new AdminUserDTO(userRepository.save(user));
    }

    public java.util.Map<String, Long> getUserSummary() {
        List<User> users = userRepository.findAll();
        long total = users.size();
        long active = users.stream().filter(User::isEnabled).count();
        long inactive = total - active;
        long pending = users.stream().filter(u -> "PENDING".equalsIgnoreCase(u.getVerificationStatus().name())).count();
        return java.util.Map.of(
            "totalUsers", total,
            "activeUsers", active,
            "inactiveUsers", inactive,
            "pendingVerification", pending
        );
    }
}
