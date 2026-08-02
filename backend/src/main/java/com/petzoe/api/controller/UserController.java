package com.petzoe.api.controller;

import com.petzoe.api.entity.User;
import com.petzoe.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/veterinarians")
    public ResponseEntity<List<Map<String, Object>>> getVeterinarians() {
        List<User> veterinarians = userRepository.findByRole("Veterinarian");
        List<Map<String, Object>> response = veterinarians.stream()
                .map(v -> Map.of(
                        "id", (Object) v.getId(),
                        "name", (Object) v.getName(),
                        "email", (Object) v.getEmail(),
                        "phone", (Object) v.getPhone()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
