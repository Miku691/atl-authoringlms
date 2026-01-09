package com.atl.gateway.exception;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
        Map<String, Object> map = super.getErrorAttributes(request, options);
        Map<String, Object> errorResponse = new LinkedHashMap<>();

        errorResponse.put("status", "FAILED");
        errorResponse.put("statusCode", map.get("status"));

        // Use message from exception or default
        Object message = map.get("message");
        if (map.get("error") != null && message != null) {
            errorResponse.put("message", message);
        } else {
            errorResponse.put("message", map.get("error"));
        }

        // Hide internal details
        return errorResponse;
    }
}
