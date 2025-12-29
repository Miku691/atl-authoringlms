package com.ims.staff.controller;

import com.ims.staff.dto.ImsStaffRolesDto;
import com.ims.staff.service.ImsStaffRolesService;
import com.ims.staff.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff-roles")
@RequiredArgsConstructor
public class ImsStaffRolesController {

    private final ImsStaffRolesService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsStaffRolesDto>> assignRole(
            @RequestBody ImsStaffRolesDto dto) {

        ImsStaffRolesDto saved = service.assignRole(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStaffRolesDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Role assigned to staff successfully")
                        .apiData(saved)
                        .build()
        );
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<ApiResponse<List<ImsStaffRolesDto>>> getRolesByStaff(
            @PathVariable String staffId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsStaffRolesDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff roles fetched successfully")
                        .apiData(service.getRolesByStaff(staffId))
                        .build()
        );
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<ApiResponse<Void>> removeRole(
            @PathVariable String roleId) {

        service.removeRole(roleId);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff role removed successfully")
                        .apiData(null)
                        .build()
        );
    }
}
