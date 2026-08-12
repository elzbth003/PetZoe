package com.petzoe.api.controller;

import com.petzoe.api.dto.AdminUserDTO;
import com.petzoe.api.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> toggleUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(adminUserService.toggleUserStatus(id, enabled));
    }
}
