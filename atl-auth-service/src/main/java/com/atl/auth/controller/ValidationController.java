package com.atl.auth.controller;

import com.atl.auth.exception.ApiResponse;
import com.atl.auth.service.AuthUtil;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class ValidationController {

    private final AuthUtil authUtil;

    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(
                    ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Missing or invalid Authorization header"),
                    HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            boolean isValid = authUtil.validateToken(token);
            if (!isValid) {
                return new ResponseEntity<>(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Invalid Token"),
                        HttpStatus.UNAUTHORIZED);
            }

            Claims claims = authUtil.getClaims(token);
            // Return essential claims for downstream services
            Map<String, Object> data = Map.of(
                    "userId", claims.getSubject(), // subject is usually username or email in AuthUtil, check logic
                    // "email", ... depends on what's in Subject
                    "tenantId", claims.get("tenantId") != null ? claims.get("tenantId") : "",
                    "roles", claims.get("roles") // Assuming roles are in claims
            );

            return new ResponseEntity<>(ApiResponse.success(HttpStatus.OK.value(), "Token is valid", data),
                    HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(
                    ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Token validation failed: " + e.getMessage()),
                    HttpStatus.UNAUTHORIZED);
        }
    }
}
