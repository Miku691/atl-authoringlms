package com.atl.auth.exception;

import com.atl.auth.utility.ApplicationConstant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private String status;
    private int statusCode;
    private String message;
    private T apiData;

    public static <T> ApiResponse<T> success(int code, String message, T data) {
        return ApiResponse.<T>builder()
                .status(ApplicationConstant.API_SUCCESS)
                .statusCode(code)
                .message(message)
                .apiData(data)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .status(ApplicationConstant.API_FAILED)
                .statusCode(code)
                .message(message)
                .apiData(null)
                .build();
    }
}