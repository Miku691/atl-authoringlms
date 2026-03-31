package com.ims.reports.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String ROLES_HEADER = "X-Roles";
    private static final String TENANT_ID_HEADER = "X-Tenant-Id";

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            // Propagate Authorization header
            String authHeader = request.getHeader(AUTHORIZATION_HEADER);
            if (authHeader != null) {
                template.header(AUTHORIZATION_HEADER, authHeader);
            }

            // Propagate Gateway Identity headers (mandatory for internal service authentication)
            String userId = request.getHeader(USER_ID_HEADER);
            if (userId != null) {
                template.header(USER_ID_HEADER, userId);
            }

            String roles = request.getHeader(ROLES_HEADER);
            if (roles != null) {
                template.header(ROLES_HEADER, roles);
            }

            String tenantId = request.getHeader(TENANT_ID_HEADER);
            if (tenantId != null) {
                template.header(TENANT_ID_HEADER, tenantId);
            }
        }
    }
}
