package com.ims.finance.client;

import com.ims.finance.dto.ExternalEmailRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

/**
 * Reactive client for ims-notification-service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebClient {

    private final WebClient.Builder webClientBuilder;
    private static final String NOTIFICATION_SERVICE_NAME = "ims-notification-service";
    private static final String NOTIFICATION_PATH = "/api/v1/notifications/email";

    /**
     * Sends an email via the notification service.
     */
    public Mono<Void> sendEmail(ExternalEmailRequestDTO request, String userId, String roles, String tenantId) {
        log.info("[WEBCLIENT] Sending email to: {} for Receipt", request.getTo());

        return webClientBuilder.build()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .scheme("http")
                        .host(NOTIFICATION_SERVICE_NAME)
                        .path(NOTIFICATION_PATH)
                        .build())
                .header("X-User-Id", userId)
                .header("X-Roles", roles)
                .header("X-Tenant-Id", tenantId)
                .bodyValue(request)
                .retrieve()
                .toBodilessEntity()
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .doBeforeRetry(retrySignal -> log.warn("[RETRY] Attempt {} for email notification to {}", 
                                retrySignal.totalRetries() + 1, request.getTo())))
                .doOnSuccess(v -> log.info("[SUCCESS] Email notification request accepted for: {}", request.getTo()))
                .doOnError(error -> log.error("[ERROR] Failed to send email after retries: {}", error.getMessage()))
                .then(); // Return Mono<Void>
    }
}
