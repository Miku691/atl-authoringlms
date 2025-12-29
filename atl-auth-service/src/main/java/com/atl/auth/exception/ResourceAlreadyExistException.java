package com.atl.auth.exception;

public class ResourceAlreadyExistException extends RuntimeException{
    private String field;
    private String data;

    public ResourceAlreadyExistException(String field, String data){
        super("Details already exist " + field + " - " + data);
        this.field = field;
        this.data = data;
    }
}
