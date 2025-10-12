package com.atl.auth.exception;

public class CustomAuthException extends RuntimeException{
    private String message;
    public CustomAuthException(String message) {
        super(message);
        this.message = message;
    }
}
