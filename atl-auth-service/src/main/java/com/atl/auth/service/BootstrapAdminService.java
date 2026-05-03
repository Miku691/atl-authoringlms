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
        private final AtlRedisService atlRedisService;
        private final ExternalNotificationClient notificationClient;

        /**
         * 🚀 Creating a bootstrap admin - super admin which will manage the app
         *
         */
        public ApiResponse<AtlSinginResponseDto> createBootstrapAdmin(BootstrapAdminRequestDto dto) {
                // Check if email is verified in Redis
                String verifiedKey = ApplicationConstant.REG_VERIFIED_PREFIX + dto.getEmail();
                if (!Boolean.TRUE.equals(atlRedisService.checkKeyExistence(verifiedKey))) {
                        return ApiResponse.<AtlSinginResponseDto>builder()
                                        .message("Email not verified. Please verify your email first.")
                                        .status(ApplicationConstant.API_FAILED)
                                        .statusCode(HttpStatus.FORBIDDEN.value())
                                        .apiData(null)
                                        .build();
                }

                AtlUser admin = new AtlUser();
                // AtlRole superAdmin =
                // roleRepo.findByRoleName(ApplicationConstant.TENANT_ADMIN_ROLE)
                // .orElseThrow(() -> new ResourceNotFoundException("Role Name",
                // "SUPER_ADMIN"));

                admin.setUsername(dto.getEmail());
                admin.setEmail(dto.getEmail());
                admin.setPassword(passwordEncoder.encode(dto.getPassword()));

                admin.setTenant(null);

                admin.setRoles(roleService.setDefaultRole(ApplicationConstant.TENANT_ADMIN_ROLE));
                admin.setPlanName(dto.getPlanName());

                AtlUser saved = userRepo.save(admin);

                // After successful creation, delete the verification key
                atlRedisService.deleteRedisKey(verifiedKey);

                // Send Welcome/Success Email
                sendSuccessEmail(saved.getEmail(), dto.getAdminName());

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

        private void sendSuccessEmail(String email, String adminName) {
                java.util.Map<String, Object> templateData = new java.util.HashMap<>();
                templateData.put("adminName", adminName);

                com.atl.auth.dto.ExternalEmailRequestDto emailRequest = com.atl.auth.dto.ExternalEmailRequestDto.builder()
                                .to(email)
                                .subject("Account Created Successfully - Welcome to IMS")
                                .templateName("registration-success")
                                .templateData(templateData)
                                .isHtml(true)
                                .build();

                notificationClient.sendEmail(emailRequest);
        }
}
