package com.ims.finance.client;

import com.ims.finance.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

/**
 * Reactive client for ims-reports-service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReportsWebClient {

    private final WebClient.Builder webClientBuilder;
    private static final String REPORTS_SERVICE_NAME = "ims-reports-service";
    private static final String REPORTS_PATH = "/api/v1/reports/generate-invoice";

    /**
     * Triggers invoice generation in the reports service.
     */
    public Mono<String> generateInvoice(String receiptNo, String tenantId, String userId, String roles) {
        log.info("[WEBCLIENT] Requesting invoice generation for Receipt: {} (Tenant: {})", receiptNo, tenantId);

        return webClientBuilder.build()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .scheme("http")
                        .host(REPORTS_SERVICE_NAME)
                        .path(REPORTS_PATH)
                        .queryParam("receiptNo", receiptNo)
                        .queryParam("tenantId", tenantId)
                        .build())
                .header("X-User-Id", userId)
                .header("X-Roles", roles)
                .header("X-Tenant-Id", tenantId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<ApiResponse<String>>() {})
                .map(response -> {
                    if (response != null && "SUCCESS".equals(response.getStatus())) {
                        return response.getApiData();
                    }
                    return "";
                })
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .doBeforeRetry(retrySignal -> log.warn("[RETRY] Attempt {} for invoice generation (Receipt: {})", 
                                retrySignal.totalRetries() + 1, receiptNo)))
                .doOnSuccess(path -> {
                    if (path != null && !path.isEmpty()) {
                        log.info("[SUCCESS] Invoice PDF path received: {}", path);
                    } else {
                        log.warn("[WARN] Invoice generation returned empty path for: {}", receiptNo);
                    }
                })
                .doOnError(error -> log.error("[ERROR] Failed to trigger invoice generation after retries: {}", error.getMessage()))
                .onErrorResume(e -> Mono.empty()); // Fallback to empty so the chain can continue or fail gracefully
    }
}
