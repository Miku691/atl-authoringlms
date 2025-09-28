package com.authoring.tool.utility;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.authoring.tool.exception.DetailsNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler<T> {
	@ExceptionHandler(DetailsNotFoundException.class)
	public ResponseEntity<ApiResponse<T>> DetailsNotFoundException(DetailsNotFoundException e) {
		return new ResponseEntity<ApiResponse<T>>(
				new ApiResponse<T>("FAILED", e.getMessage(), 500, null),
				HttpStatus.INTERNAL_SERVER_ERROR
					);
	}
}
