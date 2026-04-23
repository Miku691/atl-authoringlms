package com.ims.platform.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "ims-student-service")
public interface StudentClient {

    @GetMapping("/students/count/tenant/{tenantId}")
    Map<String, Object> getStudentCount(@PathVariable("tenantId") String tenantId);
}
