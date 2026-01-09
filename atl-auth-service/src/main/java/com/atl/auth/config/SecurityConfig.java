package com.atl.auth.config;

import com.atl.auth.utility.AuthenticationFromGatewayFilter;
import com.atl.auth.utility.CustomAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationFromGatewayFilter gatewayFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(
                        sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .addFilterBefore(gatewayFilter, UsernamePasswordAuthenticationFilter.class)

                .exceptionHandling(
                        exceptionConfig -> exceptionConfig.authenticationEntryPoint(authenticationEntryPoint))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // .requestMatchers("/auth/signin", "/auth/signup").permitAll()
                        .requestMatchers("/auth/signin", "/auth/otp/**", "/auth/onboard-admin", "/auth/forgot-password/**").permitAll()
                        .requestMatchers("/auth/signup").hasRole("TENANT_ADMIN")

                        .requestMatchers("/tenants/**").hasRole("TENANT_ADMIN")
                        .requestMatchers("/roles/**").hasRole("TENANT_ADMIN")
                        .anyRequest().authenticated());
        return httpSecurity.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
