package com.ims.academic.util;

import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> resourceNotFoundExceptionHandler(ResourceNotFoundException ex){
        return new ResponseEntity<>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.NOT_FOUND.value())
                        .message(ex.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ResourceAlreadyExistException.class)
    public ResponseEntity<ApiResponse<String>> resourceAlreadyExistExceptionHandler(ResourceAlreadyExistException ex){
        return new ResponseEntity<>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.CONFLICT.value())
                        .message(ex.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.CONFLICT
        );
    }
}
