package com.ims.finance.config;

import com.ims.finance.util.SecurityConstant;
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
                // Propagate current user ID
                requestTemplate.header(SecurityConstant.USER_ID_HEADER, authentication.getPrincipal().toString());

                // Propagate current roles (stripping ROLE_ prefix if present)
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
                // Fallback for system-to-service calls
                requestTemplate.header(SecurityConstant.USER_ID_HEADER, "SYSTEM");
                requestTemplate.header(SecurityConstant.ROLES_HEADER, "INTERNAL");
            }
        };
    }
}
