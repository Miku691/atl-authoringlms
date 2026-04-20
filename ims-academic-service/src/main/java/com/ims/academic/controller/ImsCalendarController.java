package com.ims.academic.controller;

import com.ims.academic.dto.CalendarEventDto;
import com.ims.academic.service.ImsCalendarService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("calendar")
@RequiredArgsConstructor
public class ImsCalendarController {

    private final ImsCalendarService service;

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getCalendarSummary(
            @RequestParam String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String role) {
        
        List<CalendarEventDto> events = service.getCalendarEvents(tenantId, startDate, endDate, personId, role);
        
        return ResponseEntity.ok(
                ApiResponse.<List<CalendarEventDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Calendar events fetched successfully")
                        .apiData(events)
                        .build());
    }
}
