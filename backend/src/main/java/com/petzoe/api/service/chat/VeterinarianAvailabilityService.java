package com.petzoe.api.service.chat;

import com.petzoe.api.dto.AiQuickActionDTO;
import com.petzoe.api.dto.DoctorDayScheduleDTO;
import com.petzoe.api.dto.SlotAvailabilityDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Dedicated live veterinarian availability retrieval service.
 * Inspects verified veterinarian records, working hours, booked appointments,
 * and real-time slot generation rules directly from the PetZoe database.
 */
@Service
@Transactional(readOnly = true)
public class VeterinarianAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(VeterinarianAvailabilityService.class);

    private final UserRepository userRepository;
    private final AppointmentService appointmentService;

    private static final Pattern AVAILABILITY_PATTERN = Pattern.compile(
            "(?i)\\b(available|availability|free slot|free slots|open slot|open slots|appointment slot|appointment slots|clinic hours|working hours|when is|is dr|can i book|book a vet|see a doctor|consultation slot)\\b"
    );

    public record AvailabilityResult(
            LocalDate dateChecked,
            String dateLabel,
            String doctorQuery,
            String timePreference,
            String formattedContext,
            String directResponse,
            List<AiQuickActionDTO> quickActions,
            int totalOpenSlots
    ) {}

    public VeterinarianAvailabilityService(UserRepository userRepository,
                                           AppointmentService appointmentService) {
        this.userRepository = userRepository;
        this.appointmentService = appointmentService;
    }

    public boolean isAvailabilityQuery(String message) {
        if (message == null || message.isBlank()) return false;
        String lower = message.toLowerCase();
        boolean hasAvailabilityKeyword = AVAILABILITY_PATTERN.matcher(message).find() ||
                lower.contains("available tomorrow") || lower.contains("available today") ||
                lower.contains("slots tomorrow") || lower.contains("slots today") ||
                lower.contains("vet tomorrow") || lower.contains("doctor tomorrow");
        return hasAvailabilityKeyword;
    }

    public AvailabilityResult resolveAvailability(String userMessage) {
        String msg = (userMessage != null) ? userMessage : "";
        LocalDate targetDate = parseTargetDate(msg);
        String doctorCandidate = extractCandidateDoctorName(msg);
        String timeFilter = extractTimePreference(msg);
        String specFilter = extractSpecializationPreference(msg);

        List<User> verifiedVets = userRepository.findByRole("Veterinarian").stream()
                .filter(u -> u.isEnabled() && u.getVerificationStatus() == VerificationStatus.APPROVED)
                .collect(Collectors.toList());

        if (doctorCandidate != null && !doctorCandidate.isBlank()) {
            String cleanDoc = doctorCandidate.toLowerCase().trim();
            verifiedVets = verifiedVets.stream()
                    .filter(v -> v.getName() != null && v.getName().toLowerCase().contains(cleanDoc))
                    .collect(Collectors.toList());
        }

        if (specFilter != null && !specFilter.isBlank() && (doctorCandidate == null || doctorCandidate.isBlank())) {
            String cleanSpec = specFilter.toLowerCase();
            List<User> specMatched = verifiedVets.stream()
                    .filter(v -> v.getSpecialization() != null && v.getSpecialization().toLowerCase().contains(cleanSpec))
                    .collect(Collectors.toList());
            if (!specMatched.isEmpty()) {
                verifiedVets = specMatched;
            }
        }

        String dateLabel = targetDate.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"));
        StringBuilder contextSb = new StringBuilder();
        StringBuilder responseSb = new StringBuilder();
        List<AiQuickActionDTO> quickActions = new ArrayList<>();
        int totalOpenSlots = 0;

        contextSb.append(String.format("LIVE VETERINARIAN APPOINTMENT AVAILABILITY (PETZOE REAL-TIME SCHEDULE):\nDate Checked: %s\n\n", dateLabel));

        if (verifiedVets.isEmpty()) {
            String noVetMsg = doctorCandidate != null
                    ? String.format("Dr. %s was not found among verified veterinarians eligible for booking.", doctorCandidate)
                    : "No verified veterinarians matching your search were found.";
            contextSb.append(noVetMsg).append("\n");
            responseSb.append(noVetMsg).append(" You can browse all verified doctors under the **Veterinarian Directory** on your dashboard.");
            quickActions.add(AiQuickActionDTO.navigateAction("Veterinarian Directory", "/dashboard/owner?tab=Appointments"));
            return new AvailabilityResult(targetDate, dateLabel, doctorCandidate, timeFilter,
                    contextSb.toString(), responseSb.toString(), quickActions, 0);
        }

        responseSb.append(String.format("Here is the real-time veterinary consultation availability for **%s**:\n\n", dateLabel));

        for (User vet : verifiedVets) {
            DoctorDayScheduleDTO schedule;
            try {
                schedule = appointmentService.getDoctorSlotAvailability(vet.getId(), targetDate);
            } catch (Exception e) {
                log.warn("Could not retrieve schedule for vet {}: {}", vet.getId(), e.getMessage());
                continue;
            }

            String docDisplayName = vet.getName().startsWith("Dr.") ? vet.getName() : "Dr. " + vet.getName();
            String spec = (vet.getSpecialization() != null) ? vet.getSpecialization() : "General Practice";
            String clinic = (vet.getAddress() != null) ? vet.getAddress() : "PetZoe Certified Clinic";

            if (!schedule.isWorkingDay()) {
                contextSb.append(String.format("• %s (%s)\n  Status: Off Duty on %ss. Working hours: %s\n\n",
                        docDisplayName, spec, schedule.dayOfWeek(), schedule.workingHours()));
                responseSb.append(String.format("• **%s** (%s) does not hold clinic hours on %ss.\n",
                        docDisplayName, spec, schedule.dayOfWeek()));
                continue;
            }

            List<SlotAvailabilityDTO> openSlots = schedule.slots().stream()
                    .filter(SlotAvailabilityDTO::available)
                    .filter(s -> matchesTimeFilter(s.slot(), timeFilter))
                    .collect(Collectors.toList());

            totalOpenSlots += openSlots.size();

            contextSb.append(String.format("• %s (%s)\n  Clinic: %s | Hours: %s\n",
                    docDisplayName, spec, clinic, schedule.workingHours()));

            if (openSlots.isEmpty()) {
                contextSb.append("  Status: FULLY BOOKED for the requested time.\n\n");
                responseSb.append(String.format("• **%s** (%s): Fully booked on this date.\n",
                        docDisplayName, spec));
            } else {
                List<String> slotTimes = openSlots.stream().map(SlotAvailabilityDTO::slot).collect(Collectors.toList());
                contextSb.append(String.format("  Available Open Slots (%d): %s\n\n",
                        openSlots.size(), String.join(", ", slotTimes)));
                responseSb.append(String.format("• **%s** (%s): **%d open slots** available (%s)\n",
                        docDisplayName, spec, openSlots.size(), String.join(", ", slotTimes)));

                if (quickActions.size() < 3) {
                    quickActions.add(AiQuickActionDTO.navigateAction("Book " + docDisplayName, "/dashboard/owner?tab=Appointments"));
                }
            }
        }

        if (totalOpenSlots == 0) {
            responseSb.append("\nAll appointment slots are currently taken for this date. Would you like to check availability for the following day?");
            quickActions.add(AiQuickActionDTO.promptAction("Check Day After Tomorrow", "Which veterinarians are available day after tomorrow?"));
        } else {
            responseSb.append("\nTo book a consultation, select a doctor in your **Appointments** tab or click one of the quick actions below.");
        }
        quickActions.add(AiQuickActionDTO.navigateAction("View Appointments", "/dashboard/owner?tab=Appointments"));

        return new AvailabilityResult(targetDate, dateLabel, doctorCandidate, timeFilter,
                contextSb.toString(), responseSb.toString(), quickActions, totalOpenSlots);
    }

    private LocalDate parseTargetDate(String message) {
        String lower = message.toLowerCase();
        LocalDate today = LocalDate.now();

        if (lower.contains("day after tomorrow")) {
            return today.plusDays(2);
        }
        if (lower.contains("tomorrow")) {
            return today.plusDays(1);
        }
        if (lower.contains("today") || lower.contains("this evening") || lower.contains("this morning") || lower.contains("this afternoon")) {
            return today;
        }

        // Check for specific days of week
        for (DayOfWeek dow : DayOfWeek.values()) {
            if (lower.contains(dow.name().toLowerCase())) {
                LocalDate candidate = today.plusDays(1);
                while (candidate.getDayOfWeek() != dow) {
                    candidate = candidate.plusDays(1);
                }
                return candidate;
            }
        }

        // Check for explicit ISO date: YYYY-MM-DD
        Matcher dateMatcher = Pattern.compile("\\b(\\d{4}-\\d{2}-\\d{2})\\b").matcher(message);
        if (dateMatcher.find()) {
            try {
                return LocalDate.parse(dateMatcher.group(1));
            } catch (Exception ignored) {}
        }

        // Default to tomorrow if scheduling query doesn't specify
        return today.plusDays(1);
    }

    private String extractCandidateDoctorName(String message) {
        Matcher docMatcher = Pattern.compile("(?i)\\b(?:dr\\.?\\s+|doctor\\s+)([A-Za-z]+(?:\\s+[A-Za-z]+)?)\\b").matcher(message);
        if (docMatcher.find()) {
            String candidate = docMatcher.group(1).trim();
            String[] parts = candidate.split("\\s+");
            if (parts.length > 1 && isDoctorStopWord(parts[1])) {
                candidate = parts[0];
            }
            if (!isDoctorStopWord(candidate)) {
                return candidate;
            }
        }
        // Known doctor first names
        List<String> knownNames = List.of("sarah", "marcus", "priya", "elena", "david", "chloe", "anu");
        String lower = message.toLowerCase();
        for (String name : knownNames) {
            if (Pattern.compile("\\b" + name + "\\b").matcher(lower).find()) {
                return Character.toUpperCase(name.charAt(0)) + name.substring(1);
            }
        }
        return null;
    }

    private String extractTimePreference(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("morning")) return "MORNING";
        if (lower.contains("afternoon")) return "AFTERNOON";
        if (lower.contains("evening") || lower.contains("night")) return "EVENING";

        Matcher slotMatcher = Pattern.compile("(?i)\\b(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm))\\b").matcher(message);
        if (slotMatcher.find()) {
            return slotMatcher.group(1).toUpperCase().replaceAll("\\s+", " ");
        }
        return null;
    }

    private String extractSpecializationPreference(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("cat") || lower.contains("kitten") || lower.contains("feline")) return "Feline";
        if (lower.contains("dog") || lower.contains("puppy") || lower.contains("canine") || lower.contains("orthopedic")) return "Orthopedics";
        if (lower.contains("skin") || lower.contains("dermatol") || lower.contains("itch") || lower.contains("lesion")) return "Dermatology";
        if (lower.contains("dental") || lower.contains("teeth")) return "Dentistry";
        if (lower.contains("bird") || lower.contains("rabbit") || lower.contains("reptile") || lower.contains("exotic")) return "Exotic";
        return null;
    }

    private boolean matchesTimeFilter(String slot, String timeFilter) {
        if (timeFilter == null || timeFilter.isBlank()) return true;

        Matcher m = Pattern.compile("^(\\d{1,2}):").matcher(slot.trim());
        int startHour = -1;
        if (m.find()) {
            try {
                startHour = Integer.parseInt(m.group(1));
            } catch (Exception ignored) {}
        }

        if (timeFilter.equals("MORNING")) {
            if (slot.contains("AM") && !slot.startsWith("12:")) return true;
            if (!slot.contains("PM") && startHour >= 0 && startHour < 12) return true;
            return false;
        }
        if (timeFilter.equals("AFTERNOON")) {
            if (slot.contains("PM") && (slot.startsWith("12:") || slot.startsWith("01:") || slot.startsWith("02:") || slot.startsWith("03:"))) return true;
            if (!slot.contains("AM") && startHour >= 12 && startHour < 16) return true;
            return false;
        }
        if (timeFilter.equals("EVENING")) {
            if (slot.contains("PM") && (slot.startsWith("03:") || slot.startsWith("04:") || slot.startsWith("05:") || slot.startsWith("06:") || slot.startsWith("07:"))) return true;
            if (!slot.contains("AM") && startHour >= 16) return true;
            return false;
        }

        // Direct slot string match
        String cleanSlot = slot.toUpperCase().replace(" ", "");
        String cleanFilter = timeFilter.toUpperCase().replace(" ", "");
        if (cleanFilter.length() <= 4 && !cleanFilter.contains(":")) {
            // e.g. "4PM" -> "04:00PM"
            String num = cleanFilter.replaceAll("[^0-9]", "");
            String ampm = cleanFilter.replaceAll("[0-9]", "");
            return cleanSlot.startsWith(String.format("%02d:", Integer.parseInt(num))) && cleanSlot.contains(ampm);
        }

        return cleanSlot.contains(cleanFilter);
    }

    private boolean isDoctorStopWord(String word) {
        if (word == null) return true;
        String w = word.toLowerCase();
        return w.equals("visit") || w.equals("appointment") || w.equals("consultation") || w.equals("directory") ||
               w.equals("clinic") || w.equals("hospital") || w.equals("available") || w.equals("tomorrow") ||
               w.equals("today") || w.equals("now") || w.equals("near") || w.equals("free") || w.equals("open") ||
               w.equals("on") || w.equals("at") || w.equals("in") || w.equals("for") || w.equals("this") ||
               w.equals("next") || w.equals("schedule") || w.equals("working") || w.equals("hours");
    }
}
