package com.atl.gateway.security;

import com.atl.gateway.config.GatewaySecurityConfig;
import com.atl.gateway.utility.JwtUnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final GatewaySecurityConfig securityConfig;

    @Value("${atl.jwt.secret}")
    private String jwtSecret;

    public JwtAuthFilter(GatewaySecurityConfig securityConfig) {
        this.securityConfig = securityConfig;
    }

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        if (exchange.getRequest().getMethod().matches("OPTIONS")) {
            return chain.filter(exchange);
        }

        if (securityConfig.getPublicPaths().stream().anyMatch(publicPath -> {
            String cleanPath = path.replaceAll("/+", "/");
            String cleanPublic = publicPath.trim().replaceAll("/+", "/");
            return cleanPath.equals(cleanPublic) || cleanPath.startsWith(cleanPublic);
        })) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new JwtUnauthorizedException("Invalid or missing token");
        }

        String token = authHeader.split(" ")[1];
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        // check role based access.
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        // --- START ROLE VALIDATION ---
        String method = exchange.getRequest().getMethod().name();

        boolean isAuthorized = securityConfig.getRolePaths().entrySet().stream()
                .filter(entry -> path.startsWith(entry.getKey()))
                .allMatch(entry -> {
                    // Industrial Standard: Allow GET requests for domain services at gateway level
                    // Fine-grained authorization should be handled at the service level
                    if (method.equals("GET")) {
                        return true;
                    }
                    return roles.stream().anyMatch(entry.getValue()::contains);
                });

        if (!isAuthorized) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        ServerHttpRequest.Builder builder = exchange.getRequest().mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-Roles", String.join(",", claims.get("roles", List.class)));

        Object tenantIdObj = claims.get("tenantId");
        if (tenantIdObj != null) {
            builder.header("X-Tenant-Id", tenantIdObj.toString());
        }

        ServerHttpRequest serverHttpRequest = builder.build();

        return chain.filter(exchange.mutate().request(serverHttpRequest).build());
    }

    // private Mono<Void> onError(ServerWebExchange exchange, String message,
    // HttpStatus status) {
    // ServerHttpResponse response = exchange.getResponse();
    // response.setStatusCode(status);
    // response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
    //
    // ApiResponse<Object> apiResponse = new ApiResponse<>();
    // apiResponse.setStatus(ApplicationConstant.API_FAILED);
    // apiResponse.setStatusCode(status.value());
    // apiResponse.setMessage(message);
    //
    // try {
    // byte[] bytes = new ObjectMapper().writeValueAsBytes(apiResponse);
    // DataBuffer buffer = response.bufferFactory().wrap(bytes);
    // return response.writeWith(Mono.just(buffer));
    // } catch (JsonProcessingException e) {
    // return response.setComplete();
    // }
    // }

    @Override
    public int getOrder() {
        return -10; // High priority - run before Discovery Locator rewrites paths
    }
}
