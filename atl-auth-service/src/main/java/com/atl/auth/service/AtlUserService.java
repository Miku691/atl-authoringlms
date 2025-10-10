package com.atl.auth.service;

import com.atl.auth.dto.AtlSinginRequestDto;
import com.atl.auth.dto.AtlSinginResponseDto;
import com.atl.auth.dto.AtlSingupResponseDto;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtlUserService{
    private final ModelMapper modelMapper;
    private final AtlUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final AuthUtil authUtil;

    public AtlSingupResponseDto userSingupService(AtlSinginRequestDto requestDto){
        AtlUser altUserObj = new AtlUser();
        altUserObj.setUsername(requestDto.getUsername());
        altUserObj.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        AtlUser savedObj = userRepo.save(altUserObj);
        return modelMapper.map(savedObj, AtlSingupResponseDto.class);
    }

    public AtlSinginResponseDto signInService(AtlSinginRequestDto requestDto) {
        userRepo.findByUsername(requestDto.getUsername()).orElseThrow(() -> new UserNotFoundException(requestDto.getUsername()));

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDto.getUsername(), requestDto.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        AtlUser user = userDetails.getAtlUser();
        String token = authUtil.generateAccessToken(user);

        return new AtlSinginResponseDto(user.getUsername(), token);
    }
}
