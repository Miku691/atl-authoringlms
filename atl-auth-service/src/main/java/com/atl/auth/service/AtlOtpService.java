package com.atl.auth.service;

import com.atl.auth.dto.*;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.exception.CustomUnauthorizedException;
import com.atl.auth.exception.OtpVerificationException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtlOtpService {
    private final AtlUserRepo userRepo;
    private final AuthUtil authUtil;
    private final AtlEmailService atlEmailService;
    private final AtlRedisService atlRedisService;

    public AtlSendOtpResponseDto generateOtp(AtlSendOtpRequestDto sendOtpDto){
        AtlUser userObj = userRepo.findByUsername(sendOtpDto.getUsername()).orElseThrow(() -> new UserNotFoundException(sendOtpDto.getUsername()));

        //check user logged in or not
        String loggedInKey = ApplicationConstant.LOGGED_IN_PREFIX + userObj.getUsername();
        Boolean isLoggedIn = atlRedisService.checkKeyExistence(loggedInKey);

        if(!Boolean.TRUE.equals(isLoggedIn)){
            throw new CustomUnauthorizedException("User is not Logged In, Please log-in first");
        }

        String otp = authUtil.generateRandomOtp();
        String email = userObj.getEmail();
        String otpKey = ApplicationConstant.OTP_PREFIX + email;

        atlRedisService.saveValueToRedisWithTTL(otpKey, otp, 5);

        //comment for dev.
        //atlEmailService.sendTextEmail(email, "Your OTP Code", "Your OTP is: " + otp + "\nIt will expire in 5 minutes.");

        return AtlSendOtpResponseDto.builder()
                .username(userObj.getUsername())
                .message("OTP Sent Successfully")
                .build();
    }

    public ApiResponse<AtlVerifiedResDto> verifyOtp(AtlVerifyOtpReqDto verifyOtpDto) {
        boolean isOtpValid = false;
        AtlUser userObj = userRepo.findByUsername(verifyOtpDto.getUsername()).orElseThrow(() -> new UserNotFoundException(verifyOtpDto.getUsername()));

        //check user logged in or not
        String loggedInKey = ApplicationConstant.LOGGED_IN_PREFIX + userObj.getUsername();
        Boolean isLoggedIn = atlRedisService.checkKeyExistence(loggedInKey);

        if(!Boolean.TRUE.equals(isLoggedIn)){
            throw new CustomUnauthorizedException("User is not Logged In");
        }

        String key = ApplicationConstant.OTP_PREFIX + userObj.getEmail();
        String storedOtp = atlRedisService.getRedisValue(key);

        try{
            //isOtpValid = checkAndValidateOtp(storedOtp, verifyOtpDto.getOtp());
        }catch (OtpVerificationException e){
            throw new RuntimeException(e);
        }

        if(true){
            String token = authUtil.generateAccessToken(userObj);

            return ApiResponse.<AtlVerifiedResDto>builder()
                    .message(ApplicationConstant.API_OTP_VERIFY_SUCCESS_MSG)
                    .statusCode(HttpStatus.OK.value())
                    .status(ApplicationConstant.API_SUCCESS)
                    .apiData(AtlVerifiedResDto.builder()
                            .username(userObj.getUsername())
                            .jwt(token)
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

    private boolean checkAndValidateOtp(String storedOtp, String otp) throws OtpVerificationException {
        boolean isOtpValid = false;
        if (storedOtp == null) {
            throw new OtpVerificationException("Otp has been expired");
        }
        else if(!storedOtp.equals(otp)){
            throw new OtpVerificationException("Otp is invalid");
        }

        if(storedOtp.equals(otp)){
            return true;
        }

        return isOtpValid;
    }
}
