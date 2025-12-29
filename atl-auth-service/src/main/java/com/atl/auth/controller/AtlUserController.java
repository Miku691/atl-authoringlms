package com.atl.auth.controller;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.dto.BootstrapAdminRequestDto;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.AtlUserService;
import com.atl.auth.service.BootstrapAdminService;
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

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AtlSingupResponseDto>> signup(@Valid @RequestBody AtlSinginRequestDto requestDto){
        return new ResponseEntity<ApiResponse<AtlSingupResponseDto>>(userService.userSingUpService(requestDto), HttpStatus.OK);
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AtlSinginResponseDto>> singin(@RequestBody AtlSinginRequestDto requestDto){
        return new ResponseEntity<ApiResponse<AtlSinginResponseDto>>(userService.signInService(requestDto), HttpStatus.OK);
    }

    @PostMapping("/onboard-admin")
    public ResponseEntity<ApiResponse<AtlSinginResponseDto>> onBoardBootstrapAdmin(@RequestBody BootstrapAdminRequestDto adminDto){
        return new ResponseEntity<ApiResponse<AtlSinginResponseDto>>(bootstrapAdminService.createBootstrapAdmin(adminDto), HttpStatus.CREATED);
    }
}