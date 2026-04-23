package com.ims.platform.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "ims-instructor-service")
public interface InstructorClient {

    @GetMapping("/instructors/count/tenant/{tenantId}")
    Map<String, Object> getInstructorCount(@PathVariable("tenantId") String tenantId);
}
