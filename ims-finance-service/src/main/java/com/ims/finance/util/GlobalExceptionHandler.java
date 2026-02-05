package com.ims.finance.util;

import com.ims.finance.exception.ResourceAlreadyExistException;
import com.ims.finance.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<String>> resourceNotFoundExceptionHandler(ResourceNotFoundException ex) {
                return new ResponseEntity<>(
                                ApiResponse.<String>builder()
                                                .status(ApplicationConstant.API_FAILED)
                                                .statusCode(HttpStatus.NOT_FOUND.value())
                                                .message(ex.getMessage())
                                                .apiData(null)
                                                .build(),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(ResourceAlreadyExistException.class)
        public ResponseEntity<ApiResponse<String>> resourceAlreadyExistExceptionHandler(
                        ResourceAlreadyExistException ex) {
                return new ResponseEntity<>(
                                ApiResponse.<String>builder()
                                                .status(ApplicationConstant.API_FAILED)
                                                .statusCode(HttpStatus.CONFLICT.value())
                                                .message(ex.getMessage())
                                                .apiData(null)
                                                .build(),
                                HttpStatus.CONFLICT);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<List<Map<String, String>>>> handleValidationExceptions(
                        MethodArgumentNotValidException ex) {
                List<Map<String, String>> errors = ex.getBindingResult().getAllErrors().stream().map(error -> {
                        Map<String, String> err = new HashMap<>();
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        err.put("field", fieldName);
                        err.put("message", errorMessage);
                        return err;
                }).collect(Collectors.toList());

                return new ResponseEntity<>(
                                ApiResponse.<List<Map<String, String>>>builder()
                                                .status(ApplicationConstant.API_FAILED)
                                                .statusCode(HttpStatus.BAD_REQUEST.value())
                                                .message("Validation Failed")
                                                .apiData(errors)
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }
}
