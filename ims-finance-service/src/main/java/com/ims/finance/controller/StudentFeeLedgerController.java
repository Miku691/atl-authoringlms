package com.ims.finance.controller;

import com.ims.finance.dto.FinanceSummaryDTO;
import com.ims.finance.dto.StudentFeeRecordDTO;
import com.ims.finance.service.StudentFeeLedgerService;
import com.ims.finance.service.StudentFeeAllocationService;
import com.ims.finance.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing student fee records and ledger.
 */
@RestController
@RequestMapping("/api/v1/finance/ledger")
public class StudentFeeLedgerController {

    private final StudentFeeLedgerService studentFeeLedgerService;
    private final StudentFeeAllocationService studentFeeAllocationService;

    public StudentFeeLedgerController(StudentFeeLedgerService studentFeeLedgerService,
            StudentFeeAllocationService studentFeeAllocationService) {
        this.studentFeeLedgerService = studentFeeLedgerService;
        this.studentFeeAllocationService = studentFeeAllocationService;
    }

    /**
     * Retrieves the fee ledger for a specific student.
     */
    @GetMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<StudentFeeRecordDTO>>> getStudentLedger(@PathVariable String studentId) {
        List<StudentFeeRecordDTO> ledger = studentFeeLedgerService.getStudentLedger(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student ledger fetched successfully", ledger));
    }

    /**
     * Retrieves own financial ledger for the logged-in student.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentFeeRecordDTO>>> getMyLedger() {
        List<StudentFeeRecordDTO> ledger = studentFeeLedgerService.getMyLedger();
        return ResponseEntity.ok(ApiResponse.success("Your ledger fetched successfully", ledger));
    }

    /**
     * Retrieves financial ledgers for all wards of a guardian.
     */
    @GetMapping("/wards")
    @PreAuthorize("hasRole('GUARDIAN')")
    public ResponseEntity<ApiResponse<Map<String, List<StudentFeeRecordDTO>>>> getWardsLedger() {
        Map<String, List<StudentFeeRecordDTO>> ledgers = studentFeeLedgerService.getWardsLedger();
        return ResponseEntity.ok(ApiResponse.success("Wards' ledgers fetched successfully", ledgers));
    }

    /**
     * Retrieves a summary for the logged-in student.
     */
    @GetMapping("/me/summary")
    @PreAuthorize("hasAnyRole('STUDENT', 'TENANT_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FinanceSummaryDTO>> getMySummary() {
        // We'll need to fetch the studentId first inside the service or resolve it here
        // For consistency, let's just make a service method that doesn't require
        // studentId if it can resolve it
        List<StudentFeeRecordDTO> myLedger = studentFeeLedgerService.getMyLedger();
        if (myLedger.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No records found", FinanceSummaryDTO.builder().build()));
        }
        FinanceSummaryDTO summary = studentFeeLedgerService.getStudentSummary(myLedger.get(0).getStudentId());
        return ResponseEntity.ok(ApiResponse.success("Summary fetched successfully", summary));
    }

    /**
     * Retrieves all student fee records for the current tenant.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<StudentFeeRecordDTO>>> getAllLedgerRecords() {
        List<StudentFeeRecordDTO> records = studentFeeLedgerService.getAllLedgerRecords();
        return ResponseEntity.ok(ApiResponse.success("All ledger records fetched successfully", records));
    }

    /**
     * Manually triggers fee allocation for a student.
     */
    @PostMapping("/allocate")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> allocateFees(@RequestParam String studentId,
            @RequestParam String offeringId,
            @RequestParam String academicYear) {
        studentFeeAllocationService.allocateFeesToStudent(studentId, offeringId, academicYear);
        return ResponseEntity.ok(ApiResponse.success("Fees allocated successfully", null));
    }
}
