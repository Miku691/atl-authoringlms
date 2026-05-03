package com.atl.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AtlRedisService {
    private final StringRedisTemplate redisTemplate;

    public void saveValueToRedisWithTTL(String key, String value, int duration){
        redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(duration));
    }

    public String getRedisValue(String key){
        return redisTemplate.opsForValue().get(key);
    }

    public Boolean checkKeyExistence(String key){
        return redisTemplate.hasKey(key);
    }

    public void deleteRedisKey(String key) {
        redisTemplate.delete(key);
    }
}
