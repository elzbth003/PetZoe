package com.petzoe.api.service;

import com.petzoe.api.dto.AdopterProfileDTO;
import com.petzoe.api.dto.AdopterProfileRequestDTO;
import com.petzoe.api.entity.AdopterProfile;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AdopterProfileRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.util.ValidationUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Self-service adopter profile management for Pet Owners (spec section 12).
 * One profile per user, reused across every adoption application they submit.
 */
@Service
public class AdopterProfileService {

    private final AdopterProfileRepository adopterProfileRepository;
    private final UserRepository userRepository;

    public AdopterProfileService(AdopterProfileRepository adopterProfileRepository, UserRepository userRepository) {
        this.adopterProfileRepository = adopterProfileRepository;
        this.userRepository = userRepository;
    }

    public AdopterProfileDTO getMyProfile(String email) {
        User user = getUser(email);
        return adopterProfileRepository.findByUserId(user.getId())
                .map(p -> new AdopterProfileDTO(p, true))
                .orElse(null);
    }

    @Transactional
    public AdopterProfileDTO updateMyProfile(String email, AdopterProfileRequestDTO request) {
        User user = getUser(email);
        AdopterProfile profile = adopterProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            AdopterProfile p = new AdopterProfile();
            p.setUser(user);
            return p;
        });

        ValidationUtils.requireBase64WithinLimit(request.governmentIdBase64(), "Government ID");
        ValidationUtils.requireBase64WithinLimit(request.addressProofBase64(), "Address proof");

        profile.setAddress(blankToNull(request.address()));
        profile.setHousingType(request.housingType());
        profile.setLivingArrangement(request.livingArrangement());
        profile.setExistingPets(blankToNull(request.existingPets()));
        profile.setPreviousPetExperience(blankToNull(request.previousPetExperience()));
        profile.setHouseholdMembers(blankToNull(request.householdMembers()));
        profile.setPetCareExperience(blankToNull(request.petCareExperience()));
        profile.setVeterinaryCarePlan(blankToNull(request.veterinaryCarePlan()));
        profile.setCanProvideFoodAndHousing(request.canProvideFoodAndHousing());
        if (request.governmentIdBase64() != null) {
            profile.setGovernmentIdBase64(request.governmentIdBase64());
        }
        if (request.addressProofBase64() != null) {
            profile.setAddressProofBase64(request.addressProofBase64());
        }
        profile.setUpdatedAt(LocalDateTime.now());
        adopterProfileRepository.save(profile);

        return new AdopterProfileDTO(profile, true);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
