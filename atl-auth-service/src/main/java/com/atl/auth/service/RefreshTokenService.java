package com.atl.auth.service;

import com.atl.auth.entity.AtlUser;
import com.atl.auth.exception.CustomUnauthorizedException;
import com.atl.auth.exception.UserNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.repo.RefreshTokenRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
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
    private final AtlRedisService redisService;
    private final StringRedisTemplate redisTemplate;

    private static final String REDIS_REFRESH_TOKEN_PREFIX = "atl:refresh_token:";

    /*
     * public Optional<RefreshToken> findByToken(String token) {
     * return refreshTokenRepo.findByToken(token);
     * }
     */

    /*
     * @Transactional
     * public RefreshToken createRefreshToken(Long userId) {
     * AtlUser user = userRepository.findById(userId)
     * .orElseThrow(() -> new UserNotFoundException("User not found with id: " +
     * userId));
     * 
     * RefreshToken refreshToken = RefreshToken.builder()
     * .user(user)
     * .expiryDate(Instant.now().plusSeconds(refreshTokenDurationDays * 24 * 60 *
     * 60))
     * .token(authUtil.generateRefreshToken())
     * .revoked(false)
     * .build();
     * 
     * return refreshTokenRepo.save(refreshToken);
     * }
     */

    public String createRefreshToken(Long userId) {
        String token = authUtil.generateRefreshToken();
        String key = REDIS_REFRESH_TOKEN_PREFIX + token;

        // Save to Redis with TTL in days
        redisTemplate.opsForValue().set(key, userId.toString(), Duration.ofDays(refreshTokenDurationDays));

        return token;
    }

    /*
     * public RefreshToken verifyExpiration(RefreshToken token) {
     * if (token.getExpiryDate().isBefore(Instant.now())) {
     * refreshTokenRepo.delete(token);
     * throw new
     * CustomUnauthorizedException("Refresh token was expired. Please make a new signin request"
     * );
     * }
     * if (token.isRevoked()) {
     * throw new CustomUnauthorizedException("Refresh token has been revoked");
     * }
     * return token;
     * }
     */

    /*
     * @Transactional
     * public int deleteByUserId(Long userId) {
     * return refreshTokenRepo.deleteByUser(userRepository.findById(userId).get());
     * }
     */

    /*
     * @Transactional
     * public void revokeToken(String token) {
     * refreshTokenRepo.findByToken(token).ifPresent(refreshToken -> {
     * refreshToken.setRevoked(true);
     * refreshTokenRepo.save(refreshToken);
     * });
     * }
     */

    public void revokeToken(String token) {
        String key = REDIS_REFRESH_TOKEN_PREFIX + token;
        redisTemplate.delete(key);
    }

    /*
     * @Transactional
     * public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
     * String requestRefreshToken = request.getRefreshToken();
     * 
     * return findByToken(requestRefreshToken)
     * .map(this::verifyExpiration)
     * .map(RefreshToken::getUser)
     * .map(user -> {
     * // Rotate Token: Revoke old one
     * revokeToken(requestRefreshToken);
     * 
     * // Generate new pair
     * String token = authUtil.generateAccessToken(user);
     * RefreshToken newRefreshToken = createRefreshToken(user.getId());
     * 
     * return new TokenRefreshResponse(token, newRefreshToken.getToken());
     * })
     * .orElseThrow(() -> new
     * CustomUnauthorizedException("Refresh token is not in database!"));
     * }
     */

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        String key = REDIS_REFRESH_TOKEN_PREFIX + requestRefreshToken;

        String userIdStr = redisTemplate.opsForValue().get(key);
        if (userIdStr == null) {
            throw new CustomUnauthorizedException("Invalid or expired refresh token!");
        }

        Long userId = Long.valueOf(userIdStr);
        AtlUser user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Rotate Token: Revoke old one (delete from Redis)
        revokeToken(requestRefreshToken);

        // Generate new pair
        String token = authUtil.generateAccessToken(user);
        String newRefreshToken = createRefreshToken(user.getId());

        return new TokenRefreshResponse(token, newRefreshToken);
    }
}
