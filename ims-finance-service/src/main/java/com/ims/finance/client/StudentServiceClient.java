package com.ims.finance.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "ims-student-service")
public interface StudentServiceClient {

    @GetMapping("/students/user/{userId}")
    com.ims.finance.util.ApiResponse<StudentResponse> getStudentByUserId(@PathVariable("userId") String userId);

    @GetMapping("/students/profile/resolve")
    com.ims.finance.util.ApiResponse<StudentResponse> getStudentByEmail(
            @org.springframework.web.bind.annotation.RequestParam("email") String email,
            @org.springframework.web.bind.annotation.RequestParam("tenantId") String tenantId);

    @GetMapping("/enrollments/guardian/{userId}")
    com.ims.finance.util.ApiResponse<List<String>> getWardIdsByGuardianUserId(@PathVariable("userId") String userId);

    @GetMapping("/students/offering/{offeringId}")
    com.ims.finance.util.ApiResponse<List<StudentResponse>> getStudentsByOffering(
            @PathVariable("offeringId") String offeringId,
            @org.springframework.web.bind.annotation.RequestParam("tenantId") String tenantId);

    @Data
    class StudentResponse {
        private String id;
        private String userId;
        private String firstName;
        private String lastName;
        private String tenantId;
    }
}
