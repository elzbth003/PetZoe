package com.petzoe.api.controller;

import com.petzoe.api.dto.ChangePasswordRequest;
import com.petzoe.api.dto.UpdateProfileRequest;
import com.petzoe.api.dto.UserDTO;
import com.petzoe.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                  Authentication auth) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                             Authentication auth) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        userService.deleteAccount(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully."));
    }
}
