package com.ims.finance.controller;

import com.ims.finance.util.ApiResponse;
import com.ims.finance.dto.DemandNoteDTO;
import com.ims.finance.service.DemandNoteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing student demand notes (invoices).
 */
@RestController
@RequestMapping("/api/v1/finance/demand-notes")
public class DemandNoteController {

    private final DemandNoteService demandNoteService;

    public DemandNoteController(DemandNoteService demandNoteService) {
        this.demandNoteService = demandNoteService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResponse<DemandNoteDTO>> createDemandNote(@Valid @RequestBody DemandNoteDTO dto) {
        DemandNoteDTO created = demandNoteService.createDemandNote(dto);
        return ResponseEntity.ok(ApiResponse.success("Demand note generated successfully", created));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('TENANT_ADMIN') or hasRole('ACCOUNTANT') or hasRole('STUDENT') or hasRole('GUARDIAN')")
    public ResponseEntity<ApiResponse<List<DemandNoteDTO>>> getStudentDemandNotes(@PathVariable String studentId) {
        List<DemandNoteDTO> notes = demandNoteService.getStudentDemandNotes(studentId);
        return ResponseEntity.ok(ApiResponse.success("Demand notes retrieved successfully", notes));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('TENANT_ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResponse<DemandNoteDTO>> updateStatus(@PathVariable String id,
            @RequestParam String status) {
        DemandNoteDTO updated = demandNoteService.updateDemandNoteStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Demand note status updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDemandNote(@PathVariable String id) {
        demandNoteService.deleteDemandNote(id);
        return ResponseEntity.ok(ApiResponse.success("Demand note deleted", null));
    }
}
