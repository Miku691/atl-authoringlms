package com.atl.auth.utility;

import com.atl.auth.exception.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {

        String message;
        int statusCode = HttpStatus.UNAUTHORIZED.value();

        if (authException instanceof BadCredentialsException) {
            message = "Invalid username or password.";
        } else if (authException instanceof InsufficientAuthenticationException) {
            message = "Full authentication is required to access this resource.";
        } else if (authException instanceof LockedException) {
            message = "Your account is locked.";
        } else {
            String expiredMsg = (String) request.getAttribute("expired");
            String invalidMsg = (String) request.getAttribute("invalid");

            if (expiredMsg != null) message = expiredMsg;
            else if (invalidMsg != null) message = invalidMsg;
            else message = authException.getMessage(); // Fallback to the actual exception message
        }

        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(ApplicationConstant.API_FAILED);
        apiResponse.setStatusCode(statusCode);
        apiResponse.setMessage(message);
        apiResponse.setApiData(null);

        response.setStatus(statusCode);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String jsonResponse = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(jsonResponse);

    }
}
