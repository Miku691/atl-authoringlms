package com.ims.student.controller;

import com.ims.student.dto.BulkAdmissionDto;
import com.ims.student.service.impl.BulkAdmissionServiceImpl;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students/bulk")
@RequiredArgsConstructor
public class BulkAdmissionController {

    private final BulkAdmissionServiceImpl bulkService;

    @PostMapping("/{tenantId}")
    public ResponseEntity<ApiResponse<String>> bulkAdmission(@PathVariable String tenantId,
            @RequestBody List<BulkAdmissionDto> students) {
        bulkService.processBulkAdmission(students, tenantId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Bulk admission processed successfully",
                "Processed " + students.size() + " students"));
    }
}
