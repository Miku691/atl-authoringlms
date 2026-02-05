package com.atl.auth.service;

import com.atl.auth.entity.AtlRole;
import com.atl.auth.entity.AtlUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Random;

@Component
public class AuthUtil {
    @Value("${atl.jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(AtlUser user) {
        List<String> roles = user.getRoles().stream()
                .map(AtlRole::getRoleName)
                .toList();

        JwtBuilder builder = Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId().toString())
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60));

        if (user.getTenant() != null) {
            builder.claim("tenantId", user.getTenant().getId());
        }

        return builder.signWith(getSecretKey()).compact();
    }

    public String returnMaskedEmail(String rowEmail) {
        if (rowEmail == null || !rowEmail.contains("@")) {
            return rowEmail;
        }

        String[] parts = rowEmail.split("@");
        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return "***@" + domain;
        }

        String visible = local.substring(0, 2);
        return visible + "***@" + domain;
    }

    public String generateRandomOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
