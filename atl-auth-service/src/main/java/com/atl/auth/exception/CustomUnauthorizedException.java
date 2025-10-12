package com.atl.auth.exception;

public class CustomUnauthorizedException extends RuntimeException{
    private String message;
    public CustomUnauthorizedException(String message) {
        super(message);
        this.message = message;
    }
}
