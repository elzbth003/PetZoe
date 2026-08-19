package com.petzoe.api.controller;

import com.petzoe.api.dto.PublicAnimalDetailDTO;
import com.petzoe.api.dto.PublicAnimalSummaryDTO;
import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.AnimalSize;
import com.petzoe.api.service.PublicAdoptionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public, unauthenticated adoption browsing endpoints — no @PreAuthorize, permitAll in SecurityConfig. */
@RestController
@RequestMapping("/api/adoption")
public class PublicAdoptionController {

    private final PublicAdoptionService publicAdoptionService;

    public PublicAdoptionController(PublicAdoptionService publicAdoptionService) {
        this.publicAdoptionService = publicAdoptionService;
    }

    @GetMapping("/animals")
    public ResponseEntity<Page<PublicAnimalSummaryDTO>> search(
            @RequestParam(required = false) String species,
            @RequestParam(required = false) String breed,
            @RequestParam(required = false) AnimalSex sex,
            @RequestParam(required = false) AnimalSize size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        return ResponseEntity.ok(publicAdoptionService.search(species, breed, sex, size, city, state, pageable));
    }

    @GetMapping("/animals/species")
    public ResponseEntity<List<String>> getDistinctSpecies() {
        return ResponseEntity.ok(publicAdoptionService.getDistinctSpecies());
    }

    @GetMapping("/animals/{id}")
    public ResponseEntity<PublicAnimalDetailDTO> getAnimalDetail(@PathVariable Long id) {
        return ResponseEntity.ok(publicAdoptionService.getAnimalDetail(id));
    }
}
