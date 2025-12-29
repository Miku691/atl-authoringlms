package com.ims.academic.exception;

public class ResourceNotFoundException extends RuntimeException{
    private String field;
    private String data;

    public ResourceNotFoundException(String field, String data){
        super("Details not found with " + field + " - " + data);
        this.field = field;
        this.data = data;
    }
}