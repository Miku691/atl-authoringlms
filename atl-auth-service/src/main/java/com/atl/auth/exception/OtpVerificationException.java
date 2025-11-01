package com.atl.auth.exception;

public class OtpVerificationException extends RuntimeException{
    private String message;

    public OtpVerificationException(String message) {
        super(message);
        this.message = message;
    }
}
