package com.petzoe.api.dto;

import java.time.LocalDate;
import java.util.List;

public record DoctorDayScheduleDTO(
    Long veterinarianId,
    String veterinarianName,
    LocalDate date,
    boolean isWorkingDay,
    String dayOfWeek,
    String workingHours,
    String message,
    List<SlotAvailabilityDTO> slots
) {}