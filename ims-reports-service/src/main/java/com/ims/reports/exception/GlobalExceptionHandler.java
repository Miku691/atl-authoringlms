package com.ims.reports.exception;

import com.ims.reports.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ImsReportsException.class)
    public ResponseEntity<ApiResponse<Object>> handleImsReportsException(ImsReportsException ex) {
        return new ResponseEntity<>(
                ApiResponse.failed(ex.getStatus().value(), ex.getMessage()),
                ex.getStatus()
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        return new ResponseEntity<>(
                ApiResponse.failed(HttpStatus.FORBIDDEN.value(), 
                        "Access Denied: You do not have permission to access or generate this report."),
                HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(
                ApiResponse.failed(HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                        "An unexpected error occurred during report generation: " + ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
