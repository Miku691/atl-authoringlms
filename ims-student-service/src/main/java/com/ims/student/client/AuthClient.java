package com.ims.student.client;

import com.ims.student.dto.AuthSignupRequestDto;
import com.ims.student.util.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "atl-auth-service")
public interface AuthClient {

    @PostMapping("/auth/signup")
    ApiResponse<Map<String, Object>> signup(@RequestBody AuthSignupRequestDto request);
}
