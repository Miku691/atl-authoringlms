package com.authoring.tool.utility;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
	private String status;
	private String msg;
	private int statusCode;
	private T apiData;
}