package com.atl.auth.utility;

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
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String userId = request.getHeader(ApplicationConstant.USER_ID_HEADER);
        String rolesStr = request.getHeader(ApplicationConstant.ROLES_HEADER);

        if(userId != null && !userId.isEmpty() && rolesStr != null && !rolesStr.isEmpty()){

            List<GrantedAuthority> authorities = Arrays.stream(rolesStr.split(","))
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()))
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }
}
