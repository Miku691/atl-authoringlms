package com.ims.finance.client;

import com.ims.finance.util.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "ims-academic-service")
public interface OfferingServiceClient {

    @GetMapping("/offerings/{id}")
    ApiResponse<OfferingResponse> getOfferingById(@PathVariable("id") String id);

    @GetMapping("/offerings/tenant/{tenantId}")
    ApiResponse<List<OfferingResponse>> getOfferingsByTenant(@PathVariable("tenantId") String tenantId);

    @PostMapping("/offerings/bulk-fetch")
    ApiResponse<List<OfferingResponse>> getOfferingsByIds(@RequestBody List<String> ids);

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class OfferingResponse {
        private String id;
        private String name;
        private String status;
        private String tenantId;
        private String classId;
        private String yearId;
        private String courseId;
    }
}
