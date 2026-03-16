package com.ims.instructor.client;

import com.ims.instructor.dto.AuthSignupRequestDto;
import com.ims.instructor.util.ApiResponse;
import com.ims.instructor.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "atl-auth-service", configuration = FeignConfig.class)
public interface AuthClient {

    @PostMapping("/auth/signup")
    ApiResponse<Map<String, Object>> signup(@RequestBody AuthSignupRequestDto request);
}
