package com.ims.academic.controller;

import com.ims.academic.dto.GradingScaleDto;
import com.ims.academic.dto.MessageDto;
import com.ims.academic.service.GradingScaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing grading scales.
 */
@RestController
@RequestMapping("/grading-scales")
@RequiredArgsConstructor
public class GradingScaleController {

    private final GradingScaleService gradingScaleService;

    @PostMapping("/tenant/{tenantId}")
    public ResponseEntity<MessageDto> createGradingScale(
            @PathVariable String tenantId,
            @RequestBody GradingScaleDto dto) {
        return ResponseEntity.ok(gradingScaleService.createGradingScale(tenantId, dto));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<GradingScaleDto>> getGradingScales(@PathVariable String tenantId) {
        return ResponseEntity.ok(gradingScaleService.getGradingScales(tenantId));
    }

    @PutMapping("/tenant/{tenantId}/{id}")
    public ResponseEntity<MessageDto> updateGradingScale(
            @PathVariable String tenantId,
            @PathVariable String id,
            @RequestBody GradingScaleDto dto) {
        return ResponseEntity.ok(gradingScaleService.updateGradingScale(tenantId, id, dto));
    }

    @DeleteMapping("/tenant/{tenantId}/{id}")
    public ResponseEntity<MessageDto> deleteGradingScale(
            @PathVariable String tenantId,
            @PathVariable String id) {
        return ResponseEntity.ok(gradingScaleService.deleteGradingScale(tenantId, id));
    }
}
