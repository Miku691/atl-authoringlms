package com.atl.auth.service;

import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.BootstrapAdminRequestDto;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.repo.AtlRoleRepo;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BootstrapAdminService {
        private final AtlUserRepo userRepo;
        private final AtlRoleRepo roleRepo;
        private final ModelMapper modelMapper;
        private final PasswordEncoder passwordEncoder;
        private final AtlRoleService roleService;
        private final AuthUtil authUtil;

        /**
         * 🚀 Creating a bootstrap admin - super admin which will manage the app
         *
         */
        public ApiResponse<AtlSinginResponseDto> createBootstrapAdmin(BootstrapAdminRequestDto dto) {
                AtlUser admin = new AtlUser();
                // AtlRole superAdmin =
                // roleRepo.findByRoleName(ApplicationConstant.TENANT_ADMIN_ROLE)
                // .orElseThrow(() -> new ResourceNotFoundException("Role Name",
                // "SUPER_ADMIN"));

                admin.setUsername(dto.getEmail());
                admin.setEmail(dto.getEmail());
                admin.setPassword(passwordEncoder.encode(dto.getPassword()));

                admin.setTenant(null);

                admin.setStatus(ApplicationConstant.USER_INACTIVE);
                // admin.getRoles().add(superAdmin);
                admin.setRoles(roleService.setDefaultRole(ApplicationConstant.TENANT_ADMIN_ROLE));

                AtlUser saved = userRepo.save(admin);

                String maskedEmail = authUtil.returnMaskedEmail(saved.getEmail());

                return ApiResponse.<AtlSinginResponseDto>builder()
                                .message(ApplicationConstant.API_SIGNUP_SUCCESS_MSG)
                                .status(ApplicationConstant.API_SUCCESS)
                                .statusCode(HttpStatus.OK.value())
                                .apiData(new AtlSinginResponseDto(saved.getUsername(), maskedEmail, false, null, null, null))
                                .build();

                /*
                 * - Pending dev
                 * - create with set up pending..
                 * - on creation of tenant -- set the status to active
                 * - creation process -> save (pending email verify -- first :: send otp --> on
                 * verify set to set up pending)
                 */
        }

}
