package com.atl.auth.service;

import com.atl.auth.entity.AtlUser;
import com.atl.auth.entity.RefreshToken;
import com.atl.auth.exception.CustomUnauthorizedException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.repo.RefreshTokenRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import com.atl.auth.dto.TokenRefreshRequest;
import com.atl.auth.dto.TokenRefreshResponse;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${atl.jwt.refreshExpirationDays:7}")
    private Long refreshTokenDurationDays;

    private final RefreshTokenRepo refreshTokenRepo;
    private final AtlUserRepo userRepository;
    private final AuthUtil authUtil;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        AtlUser user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .expiryDate(Instant.now().plusSeconds(refreshTokenDurationDays * 24 * 60 * 60))
                .token(authUtil.generateRefreshToken())
                .revoked(false)
                .build();

        return refreshTokenRepo.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepo.delete(token);
            throw new CustomUnauthorizedException("Refresh token was expired. Please make a new signin request");
        }
        if (token.isRevoked()) {
            throw new CustomUnauthorizedException("Refresh token has been revoked");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        return refreshTokenRepo.deleteByUser(userRepository.findById(userId).get());
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepo.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshTokenRepo.save(refreshToken);
        });
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    // Rotate Token: Revoke old one
                    revokeToken(requestRefreshToken);
                    
                    // Generate new pair
                    String token = authUtil.generateAccessToken(user);
                    RefreshToken newRefreshToken = createRefreshToken(user.getId());
                    
                    return new TokenRefreshResponse(token, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new CustomUnauthorizedException("Refresh token is not in database!"));
    }
}
