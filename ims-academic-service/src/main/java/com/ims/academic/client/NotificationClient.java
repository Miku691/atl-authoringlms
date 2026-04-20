package com.ims.academic.client;

import com.ims.academic.dto.external.EmailRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ims-notification-service")
public interface NotificationClient {

    @PostMapping("/api/v1/notifications/email")
    ResponseEntity<String> sendEmail(@RequestBody EmailRequestDto request);
}
