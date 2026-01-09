package com.atl.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "atl.gateway.security")
public class GatewaySecurityConfig {
    private List<String> publicPaths = new ArrayList<>();
    private Map<String, List<String>> rolePaths = new HashMap<>();

    public List<String> getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(List<String> publicPaths) {
        this.publicPaths = publicPaths;
    }

    public Map<String, List<String>> getRolePaths() {
        return rolePaths;
    }

    public void setRolePaths(Map<String, List<String>> rolePaths) {
        this.rolePaths = rolePaths;
    }
}
