package com.ims.platform.client;

import com.ims.platform.dto.EmailRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ims-notification-service")
public interface NotificationClient {

    @PostMapping("/api/v1/notifications/email")
    void sendEmail(@RequestBody EmailRequestDto request);
}
