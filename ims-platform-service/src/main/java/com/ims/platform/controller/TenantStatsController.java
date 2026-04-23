package com.ims.platform.controller;

import com.ims.platform.client.InstructorClient;
import com.ims.platform.client.StudentClient;
import com.ims.platform.dto.ImsPlatformStatsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/platform/tenant")
@RequiredArgsConstructor
@Slf4j
public class TenantStatsController {

    private final StudentClient studentClient;
    private final InstructorClient instructorClient;

    @GetMapping("/stats/{tenantId}")
    public ResponseEntity<ImsPlatformStatsDto> getTenantPlatformStats(@PathVariable String tenantId) {
        Long studentCount = 0L;
        Long instructorCount = 0L;
        
        try {
            Map<String, Object> res = studentClient.getStudentCount(tenantId);
            if (res != null && "SUCCESS".equalsIgnoreCase((String) res.get("status"))) {
                Object data = res.get("apiData");
                if (data instanceof Number) {
                    studentCount = ((Number) data).longValue();
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch student count for tenant {}", tenantId, e);
        }
        
        try {
            Map<String, Object> res = instructorClient.getInstructorCount(tenantId);
            if (res != null && "SUCCESS".equalsIgnoreCase((String) res.get("status"))) {
                Object data = res.get("apiData");
                if (data instanceof Number) {
                    instructorCount = ((Number) data).longValue();
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch instructor count for tenant {}", tenantId, e);
        }

        return ResponseEntity.ok(new ImsPlatformStatsDto(
                studentCount != null ? studentCount : 0,
                instructorCount != null ? instructorCount : 0,
                0, // Staff count (future)
                0  // Guardian count (future)
        ));
    }
}
