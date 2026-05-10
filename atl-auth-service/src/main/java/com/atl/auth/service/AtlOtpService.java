package com.atl.auth.service;

import com.atl.auth.dto.*;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.entity.AtlRole;
import com.atl.auth.enums.TenantType;
import com.atl.auth.exception.ApiResponse;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import com.atl.auth.exception.CustomUnauthorizedException;
import com.atl.auth.exception.OtpVerificationException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atl.auth.entity.RefreshToken;
import com.atl.auth.entity.ImsTenants;
import com.atl.auth.repo.ImsTenantsRepo;
import com.atl.auth.client.AcademicClient;

@Service
@RequiredArgsConstructor
@Transactional
public class AtlOtpService {
    private final AtlUserRepo userRepo;
    private final AuthUtil authUtil;
    private final ExternalNotificationClient notificationClient;
    private final AtlRedisService atlRedisService;
    private final AcademicClient academicClient;
    private final RefreshTokenService refreshTokenService;
    private final ImsTenantsRepo tenantsRepo;

    public AtlSendOtpResponseDto generateOtp(AtlSendOtpRequestDto sendOtpDto) {
        AtlUser userObj = userRepo.findByUsername(sendOtpDto.getUsername())
                .orElseThrow(() -> new UserNotFoundException(sendOtpDto.getUsername()));

        // check user logged in or not
        String loggedInKey = ApplicationConstant.LOGGED_IN_PREFIX + userObj.getUsername();
        Boolean isLoggedIn = atlRedisService.checkKeyExistence(loggedInKey);

        if (!Boolean.TRUE.equals(isLoggedIn)) {
            throw new CustomUnauthorizedException("User is not Logged In, Please log-in first");
        }

        String otp = authUtil.generateRandomOtp();
        String email = userObj.getEmail();
        String otpKey = ApplicationConstant.OTP_PREFIX + email;

        atlRedisService.saveValueToRedisWithTTL(otpKey, otp, 5);

        // Send OTP via Notification Service
        //commented in dev mode
        //sendOtpEmail(email, otp);

        return AtlSendOtpResponseDto.builder()
                .username(userObj.getUsername())
                .message("OTP Sent Successfully")
                .build();
    }

    public ApiResponse<AtlVerifiedResDto> verifyOtp(AtlVerifyOtpReqDto verifyOtpDto) {
        boolean isOtpValid = false;
        AtlUser userObj = userRepo.findByUsername(verifyOtpDto.getUsername())
                .orElseThrow(() -> new UserNotFoundException(verifyOtpDto.getUsername()));

        // check user logged in or not
        String loggedInKey = ApplicationConstant.LOGGED_IN_PREFIX + userObj.getUsername();
        Boolean isLoggedIn = atlRedisService.checkKeyExistence(loggedInKey);

        if (!Boolean.TRUE.equals(isLoggedIn)) {
            throw new CustomUnauthorizedException("User is not Logged In");
        }

        String key = ApplicationConstant.OTP_PREFIX + userObj.getEmail();
        String storedOtp = atlRedisService.getRedisValue(key);

        try {
            //commented in dev and making default isOtpValid as true
            //isOtpValid = checkAndValidateOtp(storedOtp, verifyOtpDto.getOtp());
            isOtpValid = true;
        } catch (OtpVerificationException e) {
            throw new CustomUnauthorizedException(e.getMessage());
        }

        if (isOtpValid) {
            String token = authUtil.generateAccessToken(userObj);
            String refreshToken = refreshTokenService.createRefreshToken(userObj.getId());

            boolean tenantSetupCompleted = false;
            TenantType tenantType = null;

            if (userObj.getTenant() != null) {
                ImsTenants tenant = userObj.getTenant();
                tenantSetupCompleted = Boolean.TRUE.equals(tenant.getSetupCompleted());
                tenantType = tenant.getType();

                // Self-healing: If false, check with Academic Service
                if (!tenantSetupCompleted) {
                    try {
                        Boolean isSetupInAcademic = academicClient.checkSetupStatus(tenant.getId());
                        System.out.println(isSetupInAcademic);
                        if (Boolean.TRUE.equals(isSetupInAcademic)) {
                            tenant.setSetupCompleted(true);
                            tenantsRepo.save(tenant);
                            tenantSetupCompleted = true;
                        }
                    } catch (Exception e) {
                        // Log error but verify login, let setup flow handle it or retry later
                        // e.printStackTrace();
                        // Proceed with false
                    }
                }
            }

            return ApiResponse.<AtlVerifiedResDto>builder()
                    .message(ApplicationConstant.API_OTP_VERIFY_SUCCESS_MSG)
                    .statusCode(HttpStatus.OK.value())
                    .status(ApplicationConstant.API_SUCCESS)
                    .apiData(AtlVerifiedResDto.builder()
                            .id(String.valueOf(userObj.getId()))
                            .username(userObj.getUsername())
                            .jwt(token)
                            .refreshToken(refreshToken)
                            .roles(userObj.getRoles().stream()
                                    .map(AtlRole::getRoleName)
                                    .collect(Collectors.toSet()))
                            .email(userObj.getEmail())
                            .tenantId(userObj.getTenant() != null ? userObj.getTenant().getId() : null)
                            .tenantSetupCompleted(tenantSetupCompleted)
                            .tenantType(tenantType)
                            .passwordResetRequired(userObj.isPasswordResetRequired())
                            .build())
                    .build();
        }

        return ApiResponse.<AtlVerifiedResDto>builder()
                .message(ApplicationConstant.API_FAILURE_COMMON_MESSAGE)
                .statusCode(HttpStatus.UNAUTHORIZED.value())
                .status(ApplicationConstant.API_FAILED)
                .apiData(null)
                .build();
    }

    public void generateOtpForPasswordReset(String username) {
        String otp = authUtil.generateRandomOtp();
        AtlUser userObj = userRepo.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        String otpKey = ApplicationConstant.OTP_PREFIX + userObj.getEmail();
        atlRedisService.saveValueToRedisWithTTL(otpKey, otp, 5);

        // Send Email via Notification Service
        sendOtpEmail(userObj.getEmail(), otp);

        System.out.println("Forgot Password OTP for " + username + ": " + otp);
    }

    public ApiResponse<String> generateOtpForRegistration(String email) {
        if (userRepo.findByEmail(email).isPresent()) {
            return ApiResponse.<String>builder()
                    .message("Email is already registered. Please sign in.")
                    .status(ApplicationConstant.API_FAILED)
                    .statusCode(HttpStatus.BAD_REQUEST.value())
                    .apiData(null)
                    .build();
        }

        String otp = authUtil.generateRandomOtp();
        String otpKey = ApplicationConstant.REG_OTP_PREFIX + email;
        atlRedisService.saveValueToRedisWithTTL(otpKey, otp, 15);

        // Send OTP via Notification Service
        //Comment as dev
        //sendRegistrationOtpEmail(email, otp);

        return ApiResponse.<String>builder()
                .message("OTP sent successfully to " + email)
                .status(ApplicationConstant.API_SUCCESS)
                .statusCode(HttpStatus.OK.value())
                .apiData("OTP Sent")
                .build();
    }

    private void sendRegistrationOtpEmail(String email, String otp) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("otp", otp);

        ExternalEmailRequestDto emailRequest = ExternalEmailRequestDto.builder()
                .to(email)
                .subject("Verify Your Institute Registration")
                .templateName("registration-otp")
                .templateData(templateData)
                .isHtml(true)
                .build();

        notificationClient.sendEmail(emailRequest);
    }

    public ApiResponse<String> verifyOtpForRegistration(RegistrationOtpVerifyDto verifyDto) {
        String otpKey = ApplicationConstant.REG_OTP_PREFIX + verifyDto.getEmail();
        String storedOtp = atlRedisService.getRedisValue(otpKey);

        if (storedOtp == null) {
            return ApiResponse.<String>builder()
                    .message("OTP has expired or was not sent")
                    .status(ApplicationConstant.API_FAILED)
                    .statusCode(HttpStatus.BAD_REQUEST.value())
                    .build();
        }

        //commented as dev
//        if (!storedOtp.equals(verifyDto.getOtp())) {
//            return ApiResponse.<String>builder()
//                    .message("Invalid OTP")
//                    .status(ApplicationConstant.API_FAILED)
//                    .statusCode(HttpStatus.BAD_REQUEST.value())
//                    .build();
//        }

        // OTP is valid, mark as verified in Redis for 15 minutes
        String verifiedKey = ApplicationConstant.REG_VERIFIED_PREFIX + verifyDto.getEmail();

        atlRedisService.saveValueToRedisWithTTL(verifiedKey, "true", 15);
        
        // Remove the OTP key after successful verification
        atlRedisService.deleteRedisKey(otpKey);

        return ApiResponse.<String>builder()
                .message("Email verified successfully")
                .status(ApplicationConstant.API_SUCCESS)
                .statusCode(HttpStatus.OK.value())
                .apiData("Verified")
                .build();
    }

    private void sendOtpEmail(String email, String otp) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("otp", otp);

        ExternalEmailRequestDto emailRequest = ExternalEmailRequestDto.builder()
                .to(email)
                .subject("Your Security Verification Code")
                .templateName("otp-verification")
                .templateData(templateData)
                .isHtml(true)
                .build();

        notificationClient.sendEmail(emailRequest);
    }

    public boolean verifyOtpForPasswordReset(String username, String otp) {
        // DEV MODE: Bypassing OTP check
        return true;

        /*
         * AtlUser userObj = userRepo.findByUsername(username)
         * .orElseThrow(() -> new UserNotFoundException(username));
         * 
         * String key = ApplicationConstant.OTP_PREFIX + userObj.getEmail();
         * String storedOtp = atlRedisService.getRedisValue(key);
         * 
         * if (storedOtp == null || !storedOtp.equals(otp)) {
         * return false;
         * }
         * 
         * return true;
         */
    }

    private boolean checkAndValidateOtp(String storedOtp, String otp) throws OtpVerificationException {
        boolean isOtpValid = false;
        if (storedOtp == null) {
            throw new OtpVerificationException("Otp has been expired");
        } else if (!storedOtp.equals(otp)) {
            throw new OtpVerificationException("Otp is invalid");
        }

        if (storedOtp.equals(otp)) {
            return true;
        }

        return isOtpValid;
    }
}
