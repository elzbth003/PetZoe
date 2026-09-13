package com.petzoe.api.dto;

import java.util.List;

public record VetScheduleUpdateDTO(
    List<String> workingDays,
    String workStartTime,
    String workEndTime
) {}