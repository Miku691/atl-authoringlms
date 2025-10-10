package com.atl.auth.exception;

public class UserNotFoundException extends RuntimeException{
    private String username;

    public UserNotFoundException(String username) {
        super("User Not Available for username - "+ username);
        this.username = username;
    }
}
