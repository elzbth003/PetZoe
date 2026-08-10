package com.petzoe.api.controller;

import com.petzoe.api.dto.VetSearchDTO;
import com.petzoe.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private final UserService userService;

    public VetController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<VetSearchDTO>> getAllVets() {
        return ResponseEntity.ok(userService.getAllVets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VetSearchDTO> getVetById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getVetById(id));
    }
}
