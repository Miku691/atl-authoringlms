package com.ims.academic.client;

import com.ims.academic.util.ApiResponse;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "atl-auth-service")
public interface AuthClient {

    @GetMapping("/tenants/{id}")
    ApiResponse<TenantDetailDto> getTenantById(@PathVariable("id") String id);

    @Data
    class TenantDetailDto {
        private String id;
        private String tenantName;
        private String type; // SCHOOL, COLLEGE, COACHING
    }
}
