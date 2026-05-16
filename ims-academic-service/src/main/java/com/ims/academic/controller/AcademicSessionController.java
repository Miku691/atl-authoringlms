package com.ims.academic.controller;

import com.ims.academic.dto.AcademicSessionDto;
import com.ims.academic.service.AcademicSessionService;
import com.ims.academic.service.AcademicSessionCloneService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class AcademicSessionController {

    private final AcademicSessionService service;
    private final AcademicSessionCloneService cloneService;

    @PostMapping("/{id}/clone-structure")
    public ResponseEntity<ApiResponse<Void>> cloneStructure(
            @PathVariable String id,
            @RequestParam String sourceSessionId,
            @RequestHeader("X-Tenant-Id") String tenantId) {
        
        cloneService.cloneStructure(sourceSessionId, id, tenantId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Structure cloned successfully", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AcademicSessionDto>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Status updated", service.updateStatus(id, status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicSessionDto>> create(@RequestBody AcademicSessionDto dto) {
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Session created", service.create(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicSessionDto>> update(@PathVariable String id,
            @RequestBody AcademicSessionDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Session updated", service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicSessionDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Session details", service.getById(id)));
    }

    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<AcademicSessionDto>>> getByProgram(@PathVariable String programId) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Program sessions", service.getByProgram(programId)));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<AcademicSessionDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Tenant sessions", service.getByTenant(tenantId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Session deleted", null));
    }
}
