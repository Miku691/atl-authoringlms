package com.ims.instructor.util;

import com.ims.instructor.exception.ResourceAlreadyExistException;
import com.ims.instructor.exception.ResourceNotFoundException;
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

    @ExceptionHandler(com.ims.instructor.exception.LimitExceededException.class)
    public ResponseEntity<ApiResponse<String>> limitExceededExceptionHandler(com.ims.instructor.exception.LimitExceededException ex){
        return new ResponseEntity<>(
                ApiResponse.<String>builder()
                        .status(ApplicationConstant.API_FAILED)
                        .statusCode(HttpStatus.FORBIDDEN.value())
                        .message(ex.getMessage())
                        .apiData(null)
                        .build(),
                HttpStatus.FORBIDDEN
        );
    }
}
