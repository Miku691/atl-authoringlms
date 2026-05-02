package com.atl.auth.controller;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.dto.BootstrapAdminRequestDto;
import com.atl.auth.dto.ForgotPasswordDto;
import com.atl.auth.dto.ResetPasswordDto;
import com.atl.auth.dto.VerifyPasswordResetOtpDto;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.AtlUserService;
import com.atl.auth.service.BootstrapAdminService;
import com.atl.auth.service.RefreshTokenService;
import com.atl.auth.dto.TokenRefreshRequest;
import com.atl.auth.dto.TokenRefreshResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AtlUserController {
    private final AtlUserService userService;
    private final BootstrapAdminService bootstrapAdminService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AtlSingupResponseDto>> signup(
            @Valid @RequestBody AtlSinginRequestDto requestDto) {
        return new ResponseEntity<ApiResponse<AtlSingupResponseDto>>(userService.userSingUpService(requestDto),
                HttpStatus.OK);
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AtlSinginResponseDto>> singin(@RequestBody AtlSinginRequestDto requestDto) {
        return new ResponseEntity<ApiResponse<AtlSinginResponseDto>>(userService.signInService(requestDto),
                HttpStatus.OK);
    }

    @PostMapping("/onboard-admin")
    public ResponseEntity<ApiResponse<AtlSinginResponseDto>> onBoardBootstrapAdmin(
            @Valid @RequestBody BootstrapAdminRequestDto adminDto) {
        return new ResponseEntity<ApiResponse<AtlSinginResponseDto>>(
                bootstrapAdminService.createBootstrapAdmin(adminDto), HttpStatus.CREATED);
    }

    @PostMapping("/forgot-password/initiate")
    public ResponseEntity<ApiResponse<String>> initiateForgotPassword(@RequestBody ForgotPasswordDto requestDto) {
        return new ResponseEntity<>(userService.initiateForgotPassword(requestDto), HttpStatus.OK);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtpForReset(@RequestBody VerifyPasswordResetOtpDto requestDto) {
        return new ResponseEntity<>(userService.verifyOtpForReset(requestDto), HttpStatus.OK);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordDto requestDto) {
        return new ResponseEntity<>(userService.resetPassword(requestDto), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), 
                "Token refreshed successfully", refreshTokenService.refreshToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(@RequestBody TokenRefreshRequest request) {
        refreshTokenService.revokeToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), 
                "User logged out successfully", "Logout Successful"));
    }
}