package com.atl.auth.controller;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.service.AtlUserService;
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

    @PostMapping("/signup")
    public ResponseEntity<AtlSingupResponseDto> signup(@RequestBody AtlSinginRequestDto requestDto){
        return new ResponseEntity<AtlSingupResponseDto>(userService.userSingupService(requestDto), HttpStatus.OK);
    }

    @PostMapping("/signin")
    public ResponseEntity<AtlSinginResponseDto> singin(@RequestBody AtlSinginRequestDto requestDto){
        return new ResponseEntity<AtlSinginResponseDto>(userService.signInService(requestDto), HttpStatus.OK);
    }
}
