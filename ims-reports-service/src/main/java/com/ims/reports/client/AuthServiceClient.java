package com.ims.reports.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "atl-auth-service")
public interface AuthServiceClient {

    @GetMapping("/tenants/{id}")
    Map<String, Object> getTenantById(@PathVariable("id") String id);
}
