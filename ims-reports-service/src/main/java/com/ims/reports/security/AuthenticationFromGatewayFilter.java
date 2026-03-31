package com.ims.reports.security;

import com.ims.reports.util.SecurityConstant;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AuthenticationFromGatewayFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader(SecurityConstant.USER_ID_HEADER);
        String rolesStr = request.getHeader(SecurityConstant.ROLES_HEADER);
        String tenantId = request.getHeader(SecurityConstant.TENANT_ID_HEADER);

        if (userId != null && !userId.isEmpty() && rolesStr != null && !rolesStr.isEmpty()) {

            List<GrantedAuthority> authorities = Arrays.stream(rolesStr.split(","))
                    .map(role -> {
                        String r = role.trim().toUpperCase();
                        String prefix = SecurityConstant.ROLE_PREFIX;
                        return new SimpleGrantedAuthority(r.startsWith(prefix) ? r : prefix + r);
                    })
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId,
                    null, authorities);

            if (tenantId != null) {
                // Attach the tenantId into details so we can extract it in Controllers/Services
                authenticationToken.setDetails(tenantId);
            }

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }
}
