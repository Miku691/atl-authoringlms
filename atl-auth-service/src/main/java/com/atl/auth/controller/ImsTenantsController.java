package com.atl.auth.controller;

import com.atl.auth.dto.ImsTenantsDto;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.ImsTenantsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class ImsTenantsController {
    private final ImsTenantsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsTenantsDto>> create(@RequestBody ImsTenantsDto dto) {
        return new ResponseEntity<ApiResponse<ImsTenantsDto>>(service.create(dto), HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsTenantsDto>> update(@PathVariable String id, @RequestBody ImsTenantsDto dto) {
        ImsTenantsDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsTenantsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Tenant updated successfully")
                        .apiData(updated)
                        .build()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsTenantsDto>> getById(@PathVariable String id) {
        ImsTenantsDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsTenantsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Tenant fetched successfully")
                        .apiData(dto)
                        .build()
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsTenantsDto>>> getAll() {
        List<ImsTenantsDto> list = service.getAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ImsTenantsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Tenants fetched successfully")
                        .apiData(list)
                        .build()
        );
    }
}
