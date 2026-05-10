package com.ims.academic.dto;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for creating or updating an institute calendar event.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventRequestDto {

    // @NotBlank(message = "Title is required")
    private String title;

    private String description;

    // @NotNull(message = "Start date/time is required")
    private LocalDateTime startDate;

    // @NotNull(message = "End date/time is required")
    private LocalDateTime endDate;

    /** One of: HOLIDAY, EVENT, MEETING */
    // @NotBlank(message = "Event type is required")
    private String type;

    /** One of: ALL, TEACHER, STUDENT, ADMIN */
    // @NotBlank(message = "Target audience is required")
    private String targetAudience;

    private boolean fullDay;

    /** Hex color string, e.g. #F59E0B */
    private String color;

    private String location;

    /**
     * Populated by service from the security context; not supplied by client for
     * security events
     */
    private String createdBy;
}
