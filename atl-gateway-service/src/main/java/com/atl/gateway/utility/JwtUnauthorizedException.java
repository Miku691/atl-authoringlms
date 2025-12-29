package com.atl.gateway.utility;


public class JwtUnauthorizedException extends RuntimeException{
    public JwtUnauthorizedException(String message) {
        super(message);
    }
}