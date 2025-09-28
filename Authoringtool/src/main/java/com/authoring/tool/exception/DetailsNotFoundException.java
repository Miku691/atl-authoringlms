package com.authoring.tool.exception;


public class DetailsNotFoundException extends RuntimeException{
	private String key;
	private String value;
	
	
	public DetailsNotFoundException(String key, String value) {
		super("Details Not found for: " +key + " - " + value);
		this.key = key;
		this.value = value;
	}
}
