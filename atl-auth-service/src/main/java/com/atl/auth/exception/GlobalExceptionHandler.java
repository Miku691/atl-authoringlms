package com.atl.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> userNotFoundException(UserNotFoundException e){
        return new ResponseEntity<ApiResponse<String>>(
                new ApiResponse<String>("FAILED", 200, e.getMessage(), null), HttpStatus.OK
        );
    }
}
