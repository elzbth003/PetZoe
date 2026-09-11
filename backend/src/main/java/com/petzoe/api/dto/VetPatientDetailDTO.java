package com.petzoe.api.dto;

import java.util.List;

public record VetPatientDetailDTO(
        PetDTO pet,
        UserDTO owner,
        List<AppointmentDTO> appointments,
        List<PetMedicalRecordDTO> medicalRecords,
        List<PrescriptionDTO> prescriptions,
        List<PetVaccinationDTO> vaccinations,
        List<PetMedicalDocumentDTO> documents,
        List<PetMedicalRecordDTO> followUps
) {}
