package com.atl.auth.service;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
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

@Service
@RequiredArgsConstructor
public class AtlUserService{
    private final ModelMapper modelMapper;
    private final AtlUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final AuthUtil authUtil;
    private final AtlRoleService roleService;

    public ApiResponse<AtlSingupResponseDto> userSingUpService(AtlSinginRequestDto requestDto){

        try {
            validateSingUpRequest(requestDto);
        } catch (SQLIntegrityConstraintViolationException e) {
            throw new RuntimeException(e);
        }

        AtlUser altUserObj = new AtlUser();
        altUserObj.setUsername(requestDto.getUsername());
        altUserObj.setEmail(requestDto.getEmail());
        altUserObj.setRoles(roleService.setDefaultRole(ApplicationConstant.DEFAULT_ROLE));
        altUserObj.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        AtlUser savedObj = userRepo.save(altUserObj);
        //return modelMapper.map(savedObj, AtlSingupResponseDto.class);

        return ApiResponse.<AtlSingupResponseDto>builder()
                .message(ApplicationConstant.API_SIGNUP_SUCCESS_MSG)
                .statusCode(HttpStatus.OK.value())
                .status(ApplicationConstant.API_SUCCESS)
                .apiData(modelMapper.map(savedObj, AtlSingupResponseDto.class))
                .build();
    }


    public ApiResponse<AtlSinginResponseDto> signInService(AtlSinginRequestDto requestDto) {
        userRepo.findByUsername(requestDto.getUsername()).orElseThrow(() -> new UserNotFoundException(requestDto.getUsername()));

        try{
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getUsername(), requestDto.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            AtlUser user = userDetails.getAtlUser();
            String token = authUtil.generateAccessToken(user);

            //return new AtlSinginResponseDto(user.getUsername(), token);
            return ApiResponse.<AtlSinginResponseDto>builder()
                    .status(ApplicationConstant.API_SUCCESS)
                    .message(ApplicationConstant.API_LOGIN_SUCCESS_MSG)
                    .statusCode(HttpStatus.OK.value())
                    .apiData(new AtlSinginResponseDto(user.getUsername(), token))
                    .build();

        }catch (BadCredentialsException e){
            throw new CustomUnauthorizedException("Invalid username or password");
        }catch (UsernameNotFoundException e){
            throw new CustomUnauthorizedException("User not found");
        }catch (Exception e) {
            throw new CustomAuthException("Authentication failed: " + e.getMessage());
        }
    }


    private void validateSingUpRequest(AtlSinginRequestDto requestDto) throws SQLIntegrityConstraintViolationException {
        Optional<AtlUser> userObjUsername = userRepo.findByUsername(requestDto.getUsername());
        if(userObjUsername.isPresent()) throw new SQLIntegrityConstraintViolationException("Username Already Exist: "+ userObjUsername.get().getUsername());

        Optional<AtlUser> userObjEmail = userRepo.findByEmail(requestDto.getEmail());
        if(userObjEmail.isPresent()) throw new SQLIntegrityConstraintViolationException("Email Id Already Exist: "+ userObjEmail.get().getEmail());
    }
}
