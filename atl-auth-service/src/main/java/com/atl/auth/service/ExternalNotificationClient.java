package com.atl.auth.service;

import com.atl.auth.dto.ExternalEmailRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Client to communicate with ims-notification-service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalNotificationClient {

    private final WebClient.Builder webClientBuilder;
    private static final String NOTIFICATION_SERVICE_URL = "http://ims-notification-service/api/v1/notifications/email";

    /**
     * Sends an email via ims-notification-service.
     * 
     * @param request email details
     */
    public void sendEmail(ExternalEmailRequestDto request) {
        log.info("Sending email request to notification service for: {}", request.getTo());

        webClientBuilder.build()
                .post()
                .uri(NOTIFICATION_SERVICE_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Notification service response: {}", response))
                .doOnError(error -> log.error("Error calling notification service: {}", error.getMessage()))
                .subscribe(); // Fire and forget since notification service is async internally
    }
}
