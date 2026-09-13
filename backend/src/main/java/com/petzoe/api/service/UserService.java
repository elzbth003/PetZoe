package com.petzoe.api.service;

import com.petzoe.api.dto.ChangePasswordRequest;
import com.petzoe.api.dto.UpdateProfileRequest;
import com.petzoe.api.dto.UserDTO;
import com.petzoe.api.dto.VetSearchDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO getProfile(String email) {
        User user = getUser(email);
        return toDTO(user);
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);
        user.setName(request.name().trim());
        if (request.phone() != null) {
            String trimmed = request.phone().trim();
            user.setPhone(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.bio() != null) {
            String trimmed = request.bio().trim();
            user.setBio(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.address() != null) {
            String trimmed = request.address().trim();
            user.setAddress(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.profileImage() != null) {
            String trimmed = request.profileImage().trim();
            user.setProfileImage(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.specialization() != null) {
            String trimmed = request.specialization().trim();
            user.setSpecialization(trimmed.isEmpty() ? null : trimmed);
        }
        return toDTO(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);
        if (user.getPassword() == null || !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public void deleteAccount(String email) {
        User user = getUser(email);
        userRepository.delete(user);
    }

    public List<VetSearchDTO> getAllVets() {
        return userRepository.findByRole("Veterinarian").stream()
                .filter(u -> u.isEnabled() && u.getVerificationStatus() == com.petzoe.api.entity.VerificationStatus.APPROVED)
                .map(this::toVetDTO)
                .collect(Collectors.toList());
    }

    public VetSearchDTO getVetById(Long id) {
        User vet = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found: " + id));
        if (!"Veterinarian".equals(vet.getRole())) {
            throw new IllegalArgumentException("User is not a veterinarian.");
        }
        if (!vet.isEnabled() || vet.getVerificationStatus() != com.petzoe.api.entity.VerificationStatus.APPROVED) {
            throw new IllegalArgumentException("Veterinarian is not available or not yet approved.");
        }
        return toVetDTO(vet);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getBio(),
                user.getAddress(),
                user.getProfileImage(),
                user.getRole(),
                user.getSpecialization()
        );
    }

    private VetSearchDTO toVetDTO(User user) {
        return new VetSearchDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getBio(),
                user.getAddress(),
                user.getProfileImage(),
                user.getSpecialization()
        );
    }
}
