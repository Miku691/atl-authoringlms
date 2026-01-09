package com.ims.student.controller;

import com.ims.student.dto.ImsStudentGuardiansDto;
import com.ims.student.service.ImsStudentGuardiansService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("student-guardians")
@RequiredArgsConstructor
public class ImsStudentGuardiansController {

    private final ImsStudentGuardiansService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsStudentGuardiansDto>> create(@RequestBody ImsStudentGuardiansDto dto) {
        ImsStudentGuardiansDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStudentGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Guardian added successfully")
                        .apiData(saved)
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStudentGuardiansDto>> update(@PathVariable String id,
            @RequestBody ImsStudentGuardiansDto dto) {
        ImsStudentGuardiansDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsStudentGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian updated successfully")
                        .apiData(updated)
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStudentGuardiansDto>> getById(@PathVariable String id) {
        ImsStudentGuardiansDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsStudentGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian details fetched successfully")
                        .apiData(dto)
                        .build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<ImsStudentGuardiansDto>>> getByStudentId(@PathVariable String studentId) {
        List<ImsStudentGuardiansDto> list = service.getByStudentId(studentId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentGuardiansDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardians fetched for student ID: " + studentId)
                        .apiData(list)
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsStudentGuardiansDto>>> getAll() {
        List<ImsStudentGuardiansDto> list = service.getAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentGuardiansDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All guardians fetched successfully")
                        .apiData(list)
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian removed successfully")
                        .apiData(null)
                        .build());
    }
}
