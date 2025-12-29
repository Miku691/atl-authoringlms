package com.atl.auth.service;

import com.atl.auth.dto.MapRoleDto;
import com.atl.auth.entity.AtlRole;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.entity.RoleMaster;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.exception.ResourceNotFoundException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlRoleRepo;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.repo.RoleMasterRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AtlRoleService {
    private final AtlRoleRepo roleRepo;
    private final RoleMasterRepo roleMasterRepo;
    private final AtlUserRepo userRepo;

    public Set<AtlRole> setDefaultRole(String defaultRole) {
        Optional<AtlRole> isRoleExist = roleRepo.findByRoleName(defaultRole);
        if (isRoleExist.isPresent()) return Set.of(isRoleExist.get());

        AtlRole atlRole = roleRepo.save(AtlRole.builder().roleName(defaultRole).build());
        return Set.of(atlRole);
    }


    public ApiResponse<AtlRole> importRole(String roleCode){
        RoleMaster roleMaster = roleMasterRepo.findByRoleCode(roleCode).orElseThrow(() -> new ResourceNotFoundException("Role Code", roleCode));
        AtlRole savedRole = saveRole(AtlRole.builder().roleName(roleMaster.getRoleCode()).build());

        return ApiResponse.<AtlRole>builder()
                .status(ApplicationConstant.API_SUCCESS)
                .statusCode(HttpStatus.CREATED.value())
                .message(ApplicationConstant.ROLE_CREATION_SUCCESS_MSG)
                .apiData(savedRole)
                .build();
    }

    public AtlRole saveRole(AtlRole atlRole){
        return roleRepo.save(atlRole);
    }

    public ApiResponse<String> mapRoleToUser(MapRoleDto mapRoleDto) {
        AtlUser atlUser = userRepo.findByUsername(mapRoleDto.getUsername()).orElseThrow(() -> new UserNotFoundException(mapRoleDto.getUsername()));
        AtlRole atlRole = roleRepo.findByRoleName(mapRoleDto.getRoleCode()).orElseThrow(() -> new ResourceNotFoundException("RoleName", mapRoleDto.getRoleCode()));

        atlUser.setRoles(new HashSet<>(Set.of(atlRole)));

        userRepo.save(atlUser);

        return ApiResponse.<String>builder()
                .status(ApplicationConstant.API_SUCCESS)
                .statusCode(HttpStatus.CREATED.value())
                .message("Role Mapped Successfully")
                .apiData(null)
                .build();
    }
}
