package com.atl.gateway.security;

import com.atl.gateway.utility.JwtUnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.PathContainer;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthFilter implements GlobalFilter {
    private static final List<String> publicPaths = List.of(
            "/atl-auth/auth/signup",
            "/atl-auth/auth/signin",
            "/atl-auth/auth/otp/sendOtp",
            "/atl-auth/auth/otp/verifyOtp",
            "/atl-auth/auth/onboard-admin"
    );

    private static final Map<String, List<String>> protectedPaths = Map.of(
            "/ims-student/students", List.of("TEACHER")
    );

    @Value("${atl.jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        if (publicPaths.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            throw new JwtUnauthorizedException("Invalid or missing token");
        }

        String token = authHeader.split(" ")[1];
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        //check role based access.
        List<String> roles = claims.get("roles", List.class);

        // --- START ROLE VALIDATION ---
        boolean isAuthorized = protectedPaths.entrySet().stream()
                .filter(entry -> path.startsWith(entry.getKey()))
                .allMatch(entry -> roles.stream().anyMatch(entry.getValue()::contains));

        if (!isAuthorized) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        ServerHttpRequest serverHttpRequest = exchange.getRequest().mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-Roles", String.join(",", claims.get("roles", List.class)))
                .build();

        return chain.filter(exchange.mutate().request(serverHttpRequest).build());
    }

//    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
//        ServerHttpResponse response = exchange.getResponse();
//        response.setStatusCode(status);
//        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
//
//        ApiResponse<Object> apiResponse = new ApiResponse<>();
//        apiResponse.setStatus(ApplicationConstant.API_FAILED);
//        apiResponse.setStatusCode(status.value());
//        apiResponse.setMessage(message);
//
//        try {
//            byte[] bytes = new ObjectMapper().writeValueAsBytes(apiResponse);
//            DataBuffer buffer = response.bufferFactory().wrap(bytes);
//            return response.writeWith(Mono.just(buffer));
//        } catch (JsonProcessingException e) {
//            return response.setComplete();
//        }
//    }

}
