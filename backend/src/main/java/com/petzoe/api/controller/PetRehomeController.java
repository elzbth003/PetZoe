package com.petzoe.api.controller;

import com.petzoe.api.dto.CreateRehomeApplicationDTO;
import com.petzoe.api.dto.CreateRehomeListingDTO;
import com.petzoe.api.dto.PetRehomeApplicationDTO;
import com.petzoe.api.dto.PetRehomeListingDTO;
import com.petzoe.api.service.PetRehomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rehome")
public class PetRehomeController {

    private final PetRehomeService rehomeService;

    public PetRehomeController(PetRehomeService rehomeService) {
        this.rehomeService = rehomeService;
    }

    /**
     * Create a new rehoming listing for an owned pet.
     */
    @PostMapping("/listings")
    public ResponseEntity<PetRehomeListingDTO> createListing(
            @Valid @RequestBody CreateRehomeListingDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        PetRehomeListingDTO created = rehomeService.createListing(dto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Public browsing of active rehoming listings with species and keyword filtering.
     */
    @GetMapping("/listings")
    public ResponseEntity<List<PetRehomeListingDTO>> getActiveListings(
            @RequestParam(required = false) String species,
            @RequestParam(required = false) String query,
            Authentication authentication) {
        String currentUserEmail = (authentication != null) ? authentication.getName() : null;
        List<PetRehomeListingDTO> listings = rehomeService.getActiveListings(species, query, currentUserEmail);
        return ResponseEntity.ok(listings);
    }

    /**
     * Get details for a specific rehome listing.
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<PetRehomeListingDTO> getListingDetails(
            @PathVariable Long id,
            Authentication authentication) {
        String currentUserEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(rehomeService.getListingDetails(id, currentUserEmail));
    }

    /**
     * Get all rehome listings created by the authenticated owner.
     */
    @GetMapping("/listings/my")
    public ResponseEntity<List<PetRehomeListingDTO>> getMyListings(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.getMyListings(email));
    }

    /**
     * Cancel / withdraw a rehome listing.
     */
    @DeleteMapping("/listings/{id}")
    public ResponseEntity<PetRehomeListingDTO> cancelListing(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.cancelListing(id, email));
    }

    /**
     * Submit an adoption/rehoming application for a listing.
     */
    @PostMapping("/listings/{id}/apply")
    public ResponseEntity<PetRehomeApplicationDTO> applyForPet(
            @PathVariable Long id,
            @Valid @RequestBody CreateRehomeApplicationDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        PetRehomeApplicationDTO application = rehomeService.applyForPet(id, dto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    /**
     * Owner views all applications submitted for their listing.
     */
    @GetMapping("/listings/{id}/applications")
    public ResponseEntity<List<PetRehomeApplicationDTO>> getListingApplications(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.getApplicationsForListing(id, email));
    }

    /**
     * Applicant views applications they have submitted.
     */
    @GetMapping("/applications/my")
    public ResponseEntity<List<PetRehomeApplicationDTO>> getMyApplications(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.getMyApplications(email));
    }

    /**
     * Applicant cancels their own pending application.
     */
    @PostMapping("/applications/{id}/cancel")
    public ResponseEntity<PetRehomeApplicationDTO> cancelApplication(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.cancelApplication(id, email));
    }

    /**
     * Owner declines/rejects an application.
     */
    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<PetRehomeApplicationDTO> rejectApplication(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.rejectApplication(id, email));
    }

    /**
     * Owner accepts an application (Atomic transfer transaction).
     */
    @PostMapping("/applications/{id}/accept")
    public ResponseEntity<PetRehomeApplicationDTO> acceptApplication(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rehomeService.acceptApplication(id, email));
    }
}
