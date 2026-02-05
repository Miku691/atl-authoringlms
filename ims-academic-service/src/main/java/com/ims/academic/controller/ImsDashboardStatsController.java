package com.ims.academic.controller;

import com.ims.academic.service.ImsOfferingsService;
import com.ims.academic.service.ImsProgramsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("dashboard-stats")
@RequiredArgsConstructor
public class ImsDashboardStatsController {

    private final ImsProgramsService programsService;
    private final ImsOfferingsService offeringsService;

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAcademicStats(@PathVariable String tenantId) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalPrograms", programsService.countByTenant(tenantId));
        stats.put("totalOfferings", offeringsService.countByTenant(tenantId));

        return ResponseEntity.ok(
                ApiResponse.<Map<String, Long>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Academic stats fetched successfully")
                        .apiData(stats)
                        .build());
    }
}
