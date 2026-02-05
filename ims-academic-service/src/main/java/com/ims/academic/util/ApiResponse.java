package com.ims.academic.util;

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

    public static <T> ApiResponse<T> success(int statusCode, String message, T apiData) {
        return ApiResponse.<T>builder()
                .status("SUCCESS")
                .statusCode(statusCode)
                .message(message)
                .apiData(apiData)
                .build();
    }
}
