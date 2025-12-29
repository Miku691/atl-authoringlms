package com.ims.academic.controller;

import com.ims.academic.dto.ImsSubjectsDto;
import com.ims.academic.service.ImsSubjectsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("subjects")
@RequiredArgsConstructor
public class ImsSubjectsController {

    private final ImsSubjectsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsSubjectsDto>> create(@RequestBody ImsSubjectsDto dto) {
        ImsSubjectsDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Subject created successfully")
                        .apiData(saved)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSubjectsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Subject fetched successfully")
                        .apiData(service.getById(id))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsSubjectsDto>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsSubjectsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Subjects fetched successfully")
                        .apiData(service.getAll())
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSubjectsDto>> update(
            @PathVariable String id,
            @RequestBody ImsSubjectsDto dto) {

        return ResponseEntity.ok(
                ApiResponse.<ImsSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Subject updated successfully")
                        .apiData(service.update(id, dto))
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
                        .message("Subject deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
