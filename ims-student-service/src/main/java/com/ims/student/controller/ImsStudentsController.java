package com.ims.student.controller;

import com.ims.student.dto.ImsStudentsDto;
import com.ims.student.service.ImsStudentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("students")
@RequiredArgsConstructor
public class ImsStudentsController {

    private final ImsStudentsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsStudentsDto>> create(@RequestBody ImsStudentsDto dto) {
        ImsStudentsDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStudentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Student created successfully")
                        .apiData(saved)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStudentsDto>> update(@PathVariable String id, @RequestBody ImsStudentsDto dto) {
        ImsStudentsDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsStudentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Student updated successfully")
                        .apiData(updated)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStudentsDto>> getById(@PathVariable String id) {
        ImsStudentsDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsStudentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Student fetched successfully")
                        .apiData(dto)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsStudentsDto>>> getAll() {
        List<ImsStudentsDto> list = service.getAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Students fetched successfully")
                        .apiData(list)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Student deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
