package com.ims.platform.controller;

import com.ims.platform.client.InstructorClient;
import com.ims.platform.client.StudentClient;
import com.ims.platform.dto.ImsPlatformStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/tenant")
@RequiredArgsConstructor
public class TenantStatsController {

    private final StudentClient studentClient;
    private final InstructorClient instructorClient;

    @GetMapping("/stats/{tenantId}")
    public ResponseEntity<ImsPlatformStatsDto> getTenantPlatformStats(@PathVariable String tenantId) {
        Long studentCount = 0L;
        Long instructorCount = 0L;
        
        try {
            studentCount = studentClient.getStudentCount(tenantId);
        } catch (Exception e) {
            // Log or handle fallback
        }
        
        try {
            instructorCount = instructorClient.getInstructorCount(tenantId);
        } catch (Exception e) {
            // Log or handle fallback
        }

        return ResponseEntity.ok(new ImsPlatformStatsDto(
                studentCount != null ? studentCount : 0,
                instructorCount != null ? instructorCount : 0,
                0, // Staff count (future)
                0  // Guardian count (future)
        ));
    }
}
