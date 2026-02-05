package com.ims.student.controller;

import com.ims.student.dto.ImsStudentGuardianMappingDto;
import com.ims.student.service.ImsStudentGuardianMappingService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-guardian-mappings")
@RequiredArgsConstructor
public class ImsStudentGuardianMappingController {

    private final ImsStudentGuardianMappingService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsStudentGuardianMappingDto>> map(
            @RequestBody ImsStudentGuardianMappingDto dto) {
        ImsStudentGuardianMappingDto saved = service.map(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStudentGuardianMappingDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Student linked to guardian successfully")
                        .apiData(saved)
                        .build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<ImsStudentGuardianMappingDto>>> getByStudent(
            @PathVariable String studentId) {
        List<ImsStudentGuardianMappingDto> mappings = service.getByStudentId(studentId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentGuardianMappingDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mappings fetched for student")
                        .apiData(mappings)
                        .build());
    }

    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<ApiResponse<List<ImsStudentGuardianMappingDto>>> getByGuardian(
            @PathVariable String guardianId) {
        List<ImsStudentGuardianMappingDto> mappings = service.getByGuardianId(guardianId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentGuardianMappingDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mappings fetched for guardian")
                        .apiData(mappings)
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> unmap(@PathVariable String id) {
        service.unmap(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Student unlinked from guardian successfully")
                        .apiData(null)
                        .build());
    }
}
