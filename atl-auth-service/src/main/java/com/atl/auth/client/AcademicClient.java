package com.atl.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "IMS-ACADEMIC-SERVICE")
public interface AcademicClient {

    @GetMapping("/ims-academic/bootstrap/status")
    Boolean checkSetupStatus(@RequestParam("tenantId") String tenantId);
}
