package com.ims.platform.config;

import com.ims.platform.util.SecurityConstant;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import java.util.stream.Collectors;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() != null) {
                // Propagate current user ID from the request context (injected by Gateway)
                requestTemplate.header(SecurityConstant.USER_ID_HEADER, authentication.getPrincipal().toString());

                // Propagate current roles
                String roles = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .map(role -> role.startsWith(SecurityConstant.ROLE_PREFIX)
                                ? role.substring(SecurityConstant.ROLE_PREFIX.length())
                                : role)
                        .collect(Collectors.joining(","));
                requestTemplate.header(SecurityConstant.ROLES_HEADER, roles);

                // Propagate tenant ID from authentication details
                Object details = authentication.getDetails();
                if (details instanceof String) {
                    requestTemplate.header(SecurityConstant.TENANT_ID_HEADER, (String) details);
                }
            } else {
                // Fallback for internal system-to-service calls where no user context exists
                requestTemplate.header(SecurityConstant.USER_ID_HEADER, "SYSTEM");
                requestTemplate.header(SecurityConstant.ROLES_HEADER, "INTERNAL");
            }
        };
    }
}
