package com.ims.reports.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class SecurityUtils {

    public static String getCurrentTenantId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            return request.getHeader(SecurityConstant.TENANT_ID_HEADER);
        }
        return null;
    }

    public static String getCurrentUserId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            return request.getHeader(SecurityConstant.USER_ID_HEADER);
        }
        return null;
    }
}
