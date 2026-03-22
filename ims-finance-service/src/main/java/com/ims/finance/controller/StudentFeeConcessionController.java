package com.ims.finance.controller;

import com.ims.finance.dto.StudentFeeConcessionDTO;
import com.ims.finance.service.StudentFeeConcessionService;
import com.ims.finance.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/concessions")
public class StudentFeeConcessionController {

    private final StudentFeeConcessionService concessionService;

    public StudentFeeConcessionController(StudentFeeConcessionService concessionService) {
        this.concessionService = concessionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<StudentFeeConcessionDTO>> grantConcession(@Valid @RequestBody StudentFeeConcessionDTO request) {
        StudentFeeConcessionDTO dto = concessionService.grantConcession(request);
        return new ResponseEntity<>(
                ApiResponse.<StudentFeeConcessionDTO>builder()
                        .status("SUCCESS")
                        .message("Fee concession granted to student successfully")
                        .apiData(dto)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<StudentFeeConcessionDTO>>> getConcessionsByStudent(@PathVariable String studentId) {
        List<StudentFeeConcessionDTO> list = concessionService.getConcessionsByStudent(studentId);
        return ResponseEntity.ok(
                ApiResponse.<List<StudentFeeConcessionDTO>>builder()
                        .status("SUCCESS")
                        .message("Student fee concessions fetched successfully")
                        .apiData(list)
                        .build()
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<StudentFeeConcessionDTO>> updateConcessionStatus(
            @PathVariable String id,
            @RequestParam String status) {
        StudentFeeConcessionDTO dto = concessionService.updateConcessionStatus(id, status);
        return ResponseEntity.ok(
                ApiResponse.<StudentFeeConcessionDTO>builder()
                        .status("SUCCESS")
                        .message("Concession status updated")
                        .apiData(dto)
                        .build()
        );
    }

    @DeleteMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> revokeConcession(@PathVariable String id) {
        concessionService.revokeConcession(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .message("Fee concession revoked forever")
                        .build()
        );
    }
}
