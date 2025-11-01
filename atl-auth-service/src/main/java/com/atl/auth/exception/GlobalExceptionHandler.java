package com.atl.auth.exception;

import com.atl.auth.utility.ApplicationConstant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLIntegrityConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> userNotFoundException(UserNotFoundException e){
        return new ResponseEntity<ApiResponse<String>>(
                new ApiResponse<String>("FAILED", 401, e.getMessage(), null), HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public ResponseEntity<ApiResponse<String>> sqlIntegrityException(SQLIntegrityConstraintViolationException e){
        return new ResponseEntity<ApiResponse<String>>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.FORBIDDEN.value())
                        .message(e.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(CustomUnauthorizedException.class)
    public ResponseEntity<ApiResponse<String>> customUnauthorizedException(CustomUnauthorizedException e){
        return new ResponseEntity<ApiResponse<String>>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.UNAUTHORIZED.value())
                        .message(e.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(CustomAuthException.class)
    public ResponseEntity<ApiResponse<String>> customAuthException(CustomAuthException e){
        return new ResponseEntity<ApiResponse<String>>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.UNAUTHORIZED.value())
                        .message(e.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(OtpVerificationException.class)
    public ResponseEntity<ApiResponse<String>> verifyOtpException(OtpVerificationException ex){
        return new ResponseEntity<ApiResponse<String>>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.UNAUTHORIZED.value())
                        .message(ex.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.UNAUTHORIZED
        );
    }
}
