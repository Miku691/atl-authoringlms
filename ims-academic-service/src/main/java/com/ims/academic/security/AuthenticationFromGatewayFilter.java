package com.ims.academic.security;

import com.ims.academic.util.SecurityConstant;
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

        if (userId != null && !userId.isEmpty()) {
            List<GrantedAuthority> authorities = List.of();
            if (rolesStr != null && !rolesStr.isEmpty()) {
                authorities = Arrays.stream(rolesStr.split(","))
                        .filter(role -> role != null && !role.trim().isEmpty())
                        .map(role -> {
                            String r = role.trim().toUpperCase();
                            String prefix = SecurityConstant.ROLE_PREFIX;
                            return new SimpleGrantedAuthority(r.startsWith(prefix) ? r : prefix + r);
                        })
                        .collect(Collectors.toList());
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId,
                    null, authorities);

            if (tenantId != null) {
                authenticationToken.setDetails(tenantId);
            }

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }
}
