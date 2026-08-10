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
        user.setName(request.name());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.address() != null) user.setAddress(request.address());
        if (request.profileImage() != null) user.setProfileImage(request.profileImage());
        if (request.specialization() != null) user.setSpecialization(request.specialization());
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
                .map(this::toVetDTO)
                .collect(Collectors.toList());
    }

    public VetSearchDTO getVetById(Long id) {
        User vet = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found: " + id));
        if (!"Veterinarian".equals(vet.getRole())) {
            throw new IllegalArgumentException("User is not a veterinarian.");
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
