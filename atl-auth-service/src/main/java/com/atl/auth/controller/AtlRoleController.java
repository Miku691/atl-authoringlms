package com.atl.auth.controller;

import com.atl.auth.dto.ImportRoleDto;
import com.atl.auth.dto.MapRoleDto;
import com.atl.auth.entity.AtlRole;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.AtlRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("roles")
@RequiredArgsConstructor
public class AtlRoleController {
    private final AtlRoleService roleService;

    @PostMapping("/import-role")
    public ResponseEntity<ApiResponse<AtlRole>> importRole(@RequestBody ImportRoleDto roleDto){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.importRole(roleDto.getRoleCode()));
    }

    @PostMapping("/map-role")
    public ResponseEntity<ApiResponse<String>> mapRoleToUser(@RequestBody MapRoleDto mapRoleDto){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.mapRoleToUser(mapRoleDto));
    }
}
