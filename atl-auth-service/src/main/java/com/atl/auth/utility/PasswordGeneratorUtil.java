package com.atl.auth.utility;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

/**
 * Utility class to generate cryptographically secure random passwords.
 */
@Component
public class PasswordGeneratorUtil {

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String OTHER_CHAR = "!@#$%&*";

    private static final String PASSWORD_ALLOW_BASE = CHAR_LOWER + CHAR_UPPER + NUMBER + OTHER_CHAR;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates a random alphanumeric password of specified length.
     * 
     * @param length the length of the password
     * @return generated password
     */
    public String generateRandomPassword(int length) {
        if (length < 1)
            throw new IllegalArgumentException();

        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int rndCharAt = random.nextInt(PASSWORD_ALLOW_BASE.length());
            char rndChar = PASSWORD_ALLOW_BASE.charAt(rndCharAt);
            sb.append(rndChar);
        }

        return sb.toString();
    }
}
