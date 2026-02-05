package com.ims.finance.util;

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

    public ApiResponse(boolean success, String message, T apiData) {
        this.status = success ? "SUCCESS" : "FAILED";
        this.statusCode = success ? 200 : 500;
        this.message = message;
        this.apiData = apiData;
    }

    public static <T> ApiResponse<T> success(int statusCode, String message, T apiData) {
        return ApiResponse.<T>builder()
                .status("SUCCESS")
                .statusCode(statusCode)
                .message(message)
                .apiData(apiData)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T apiData) {
        return success(200, message, apiData);
    }
}
