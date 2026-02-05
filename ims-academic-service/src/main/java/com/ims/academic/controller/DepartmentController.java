package com.ims.academic.controller;

import com.ims.academic.dto.DepartmentDto;
import com.ims.academic.service.DepartmentService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService service;

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDto>> create(@RequestBody DepartmentDto dto) {
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Department created", service.create(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> update(@PathVariable String id, @RequestBody DepartmentDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Department updated", service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Department details", service.getById(id)));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Tenant departments", service.getByTenant(tenantId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Department deleted", null));
    }
}
