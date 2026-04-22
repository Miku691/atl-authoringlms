package com.atl.gateway.security;

import com.atl.gateway.config.GatewaySecurityConfig;
import com.atl.gateway.utility.JwtUnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.util.AntPathMatcher;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@Slf4j
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final GatewaySecurityConfig securityConfig;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

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

        boolean isPublicPath = securityConfig.getPublicPaths().stream()
                .anyMatch(publicPath -> pathMatcher.match(publicPath, path));

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.split(" ")[1];
                Claims claims = Jwts.parser()
                        .verifyWith(getSecretKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Token is valid, check role-based access if it's NOT a public path
                if (!isPublicPath) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = claims.get("roles", List.class);
                    String method = exchange.getRequest().getMethod().name();

                    boolean isAuthorized = securityConfig.getRolePaths().entrySet().stream()
                            .filter(entry -> path.startsWith(entry.getKey()))
                            .allMatch(entry -> {
                                if (method.equals("GET")) return true;
                                if (roles == null) return false;
                                return roles.stream().anyMatch(entry.getValue()::contains);
                            });

                    if (!isAuthorized) {
                        log.warn("Forbidden: User with roles {} is not authorized to access {} [{}]", roles, path, method);
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    }
                    log.debug("Authorized: Path {} allowed for roles {} [{}]", path, roles, method);
                }

                // Inject headers and proceed
                List<String> rolesList = (List<String>) claims.get("roles", List.class);
                String rolesStr = (rolesList != null) ? String.join(",", rolesList) : "";
                String userIdClaim = claims.get("userId", String.class);
                
                if (userIdClaim == null) {
                    userIdClaim = claims.getSubject(); // Fallback if userId claim is missing
                }

                ServerHttpRequest.Builder builder = exchange.getRequest().mutate()
                        .header("X-User-Id", userIdClaim)
                        .header("X-Roles", rolesStr);

                Object tenantIdObj = claims.get("tenantId");
                if (tenantIdObj != null) {
                    builder.header("X-Tenant-Id", tenantIdObj.toString());
                }

                return chain.filter(exchange.mutate().request(builder.build()).build());

            } catch (Exception e) {
                // If token is invalid and it's NOT a public path, reject
                if (!isPublicPath) {
                    log.error("JWT Validation failed for private path {}: {}", path, e.getMessage());
                    throw new JwtUnauthorizedException("Invalid or expired token");
                }
                // If token is invalid but it IS a public path, just proceed without headers
                log.warn("JWT Validation failed for public path {}. Proceeding as guest.", path);
                return chain.filter(exchange);
            }
        }

        // No token present
        if (isPublicPath) {
            return chain.filter(exchange);
        }

        throw new JwtUnauthorizedException("Invalid or missing token");
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
