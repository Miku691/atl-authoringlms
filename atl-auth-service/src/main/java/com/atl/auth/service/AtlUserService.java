package com.atl.auth.service;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.dto.*;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.exception.CustomAuthException;
import com.atl.auth.exception.CustomUnauthorizedException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Optional;
import com.atl.auth.service.AtlOtpService;

@Service
@RequiredArgsConstructor
public class AtlUserService {
    private final ModelMapper modelMapper;
    private final AtlUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final AuthUtil authUtil;
    private final AtlRoleService roleService;
    private final AtlRedisService atlRedisService;
    private final AtlOtpService otpService;
    private final com.atl.auth.repo.ImsTenantsRepo tenantsRepo;

    public ApiResponse<AtlSingupResponseDto> userSingUpService(AtlSinginRequestDto requestDto) {

        try {
            validateSingUpRequest(requestDto);
        } catch (SQLIntegrityConstraintViolationException e) {
            throw new RuntimeException(e);
        }

        AtlUser altUserObj = new AtlUser();
        altUserObj.setUsername(requestDto.getUsername());
        altUserObj.setEmail(requestDto.getEmail());

        String roleToSet = (requestDto.getRoleCode() != null && !requestDto.getRoleCode().isEmpty())
                ? requestDto.getRoleCode()
                : ApplicationConstant.DEFAULT_ROLE;

        altUserObj.setRoles(roleService.setDefaultRole(roleToSet));

        if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            altUserObj.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        } else {
            String defaultPwd = roleToSet.equalsIgnoreCase("STUDENT") ? "student@123" : "instructor@123";
            altUserObj.setPassword(passwordEncoder.encode(defaultPwd));
        }

        if (requestDto.getTenantId() != null) {
            altUserObj.setTenant(tenantsRepo.findById(requestDto.getTenantId()).orElse(null));
        }

        AtlUser savedObj = userRepo.save(altUserObj);
        // return modelMapper.map(savedObj, AtlSingupResponseDto.class);

        // return ApiResponse.<AtlSingupResponseDto>builder()
        // .message(ApplicationConstant.API_SIGNUP_SUCCESS_MSG)
        // .statusCode(HttpStatus.OK.value())
        // .status(ApplicationConstant.API_SUCCESS)
        // .apiData(modelMapper.map(savedObj, AtlSingupResponseDto.class))
        // .build();

        return ApiResponse.success(HttpStatus.OK.value(),
                ApplicationConstant.API_SIGNUP_SUCCESS_MSG, modelMapper.map(savedObj, AtlSingupResponseDto.class));
    }

    public ApiResponse<AtlSinginResponseDto> signInService(AtlSinginRequestDto requestDto) {
        userRepo.findByUsername(requestDto.getUsername())
                .orElseThrow(() -> new UserNotFoundException(requestDto.getUsername()));

        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getUsername(), requestDto.getPassword()));

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            AtlUser user = userDetails.getAtlUser();
            // String token = authUtil.generateAccessToken(user);
            String maskedEmail = authUtil.returnMaskedEmail(user.getEmail());

            String key = ApplicationConstant.LOGGED_IN_PREFIX + user.getUsername();
            atlRedisService.saveValueToRedisWithTTL(key, "true", 5);

            // return ApiResponse.<AtlSinginResponseDto>builder()
            // .status(ApplicationConstant.API_SUCCESS)
            // .message(ApplicationConstant.API_LOGIN_SUCCESS_MSG)
            // .statusCode(HttpStatus.OK.value())
            // .apiData(new AtlSinginResponseDto(user.getUsername(), maskedEmail))
            // .build();

            return ApiResponse.success(HttpStatus.OK.value(),
                    ApplicationConstant.API_LOGIN_SUCCESS_MSG,
                    new AtlSinginResponseDto(user.getUsername(), maskedEmail));

        } catch (BadCredentialsException e) {
            throw new CustomUnauthorizedException("Invalid username or password");
        } catch (UsernameNotFoundException e) {
            throw new CustomUnauthorizedException("User not found");
        } catch (Exception e) {
            throw new CustomAuthException("Authentication failed: " + e.getMessage());
        }
    }

    public String updateUserStatusOrTenantId(AtlUpdateAtlUserDto userDetails) {
        AtlUser altUserObj = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException(userDetails.getUsername()));
        altUserObj.setStatus(userDetails.getStatus());
        altUserObj.setTenant(userDetails.getTenant());

        AtlUser updateUser = userRepo.save(altUserObj);

        return "Details Updated Successfully";
    }

    private void validateSingUpRequest(AtlSinginRequestDto requestDto) throws SQLIntegrityConstraintViolationException {
        Optional<AtlUser> userObjUsername = userRepo.findByUsername(requestDto.getUsername());
        if (userObjUsername.isPresent())
            throw new SQLIntegrityConstraintViolationException(
                    "Username Already Exist: " + userObjUsername.get().getUsername());

        Optional<AtlUser> userObjEmail = userRepo.findByEmail(requestDto.getEmail());
        if (userObjEmail.isPresent())
            throw new SQLIntegrityConstraintViolationException(
                    "Email Id Already Exist: " + userObjEmail.get().getEmail());
    }

    public ApiResponse<String> initiateForgotPassword(ForgotPasswordDto requestDto) {
        AtlUser user = userRepo.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email: " + requestDto.getEmail()));

        // Check if user is active/valid if needed

        // Trigger OTP (Pass username as OtpService uses username to look up user to get
        // email... circular but works)
        otpService.generateOtpForPasswordReset(user.getUsername());

        return ApiResponse.success(HttpStatus.OK.value(),
                "OTP sent to your registered email",
                "OTP sent successfully");
    }

    public ApiResponse<String> verifyOtpForReset(VerifyPasswordResetOtpDto requestDto) {
        AtlUser user = userRepo.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email: " + requestDto.getEmail()));

        boolean isValid = otpService.verifyOtpForPasswordReset(user.getUsername(), requestDto.getOtp());
        if (!isValid) {
            throw new CustomAuthException("Invalid or Expired OTP");
        }

        return ApiResponse.success(HttpStatus.OK.value(),
                "OTP Verified Successfully",
                "OTP Verified");
    }

    public ApiResponse<String> resetPassword(ResetPasswordDto requestDto) {
        AtlUser user = userRepo.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email: " + requestDto.getEmail()));

        // Verify OTP
        boolean isValid = otpService.verifyOtpForPasswordReset(user.getUsername(), requestDto.getOtp());
        if (!isValid) {
            throw new CustomAuthException("Invalid or Expired OTP");
        }

        // Update Password
        user.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        userRepo.save(user);

        // Optionally clear OTP from Redis? It expires cleanly anyway.

        return ApiResponse.success(HttpStatus.OK.value(),
                "Password updated successfully",
                "Password reset successfully");
    }
}
