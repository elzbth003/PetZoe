package com.petzoe.api.controller;

import com.petzoe.api.dto.PetDTO;
import com.petzoe.api.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> getMyPets(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.getPetsByOwner(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.getPetById(id, email));
    }

    @PostMapping
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody PetDTO petDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.createPet(petDTO, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Long id, @Valid @RequestBody PetDTO petDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.updatePet(id, petDTO, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        petService.deletePet(id, email);
        return ResponseEntity.ok().build();
    }
}
