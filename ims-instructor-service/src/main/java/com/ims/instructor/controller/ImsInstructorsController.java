package com.ims.instructor.controller;

import com.ims.instructor.dto.ImsInstructorsDto;
import com.ims.instructor.service.ImsInstructorsService;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("instructors")
@RequiredArgsConstructor
public class ImsInstructorsController {

    private final ImsInstructorsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsInstructorsDto>> create(@RequestBody ImsInstructorsDto dto) {
        ImsInstructorsDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsInstructorsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Instructor created successfully")
                        .apiData(saved)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsInstructorsDto>> update(
            @PathVariable String id,
            @RequestBody ImsInstructorsDto dto) {

        ImsInstructorsDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsInstructorsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Instructor updated successfully")
                        .apiData(updated)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsInstructorsDto>> getById(@PathVariable String id) {
        ImsInstructorsDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsInstructorsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Instructor fetched successfully")
                        .apiData(dto)
                        .build()
        );
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorsDto>>> getByTenant(@PathVariable String tenantId) {
        List<ImsInstructorsDto> list = service.getByTenant(tenantId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Instructors fetched successfully")
                        .apiData(list)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsInstructorsDto>>> getAll() {
        List<ImsInstructorsDto> list = service.getAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All instructors fetched")
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
                        .message("Instructor deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
