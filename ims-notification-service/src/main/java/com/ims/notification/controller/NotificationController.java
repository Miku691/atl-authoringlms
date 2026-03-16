package com.ims.notification.controller;

import com.ims.notification.dto.EmailRequestDto;
import com.ims.notification.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for triggering notifications.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    /**
     * Endpoint to send an email notification.
     * 
     * @param request email details
     * @return confirmation of dispatch
     */
    @PostMapping("/email")
    public ResponseEntity<String> sendEmail(@Valid @RequestBody EmailRequestDto request) {
        emailService.sendEmail(request);
        return ResponseEntity.ok("Email dispatch initiated successfully");
    }
}
