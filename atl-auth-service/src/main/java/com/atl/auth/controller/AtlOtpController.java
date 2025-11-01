package com.atl.auth.controller;

import com.atl.auth.dto.AtlSendOtpRequestDto;
import com.atl.auth.dto.AtlSendOtpResponseDto;
import com.atl.auth.dto.AtlVerifiedResDto;
import com.atl.auth.dto.AtlVerifyOtpReqDto;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.AtlOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/otp")
@RequiredArgsConstructor
public class AtlOtpController {
    private final AtlOtpService otpService;

    @PostMapping("/sendOtp")
    public ResponseEntity<AtlSendOtpResponseDto> sendOtp(@RequestBody AtlSendOtpRequestDto sendOtpDto){
        //System.out.println("OTP requested for: " + userName);
        return new ResponseEntity<AtlSendOtpResponseDto>(otpService.generateOtp(sendOtpDto), HttpStatus.OK);
    }

    @PostMapping("verifyOtp")
    public ResponseEntity<ApiResponse<AtlVerifiedResDto>> verifyOtp(@RequestBody AtlVerifyOtpReqDto verifyOtpDto){
        return new ResponseEntity<ApiResponse<AtlVerifiedResDto>>(otpService.verifyOtp(verifyOtpDto), HttpStatus.OK);
    }
}
