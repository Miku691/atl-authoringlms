package com.ims.platform.security;

import com.ims.platform.util.ApiResponse;
import com.ims.platform.util.ApplicationConstant;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) 
            throws IOException, ServletException {

        int statusCode = HttpStatus.UNAUTHORIZED.value();
        String message = "Full authentication is required to access this resource.";

        ApiResponse<Object> apiResponse = ApiResponse.builder()
                .status(ApplicationConstant.API_FAILED)
                .statusCode(statusCode)
                .message(message)
                .apiData(null)
                .build();

        response.setStatus(statusCode);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String jsonResponse = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(jsonResponse);
    }
}
