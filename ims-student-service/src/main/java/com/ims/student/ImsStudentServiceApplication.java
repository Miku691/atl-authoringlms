package com.ims.student;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImsStudentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImsStudentServiceApplication.class, args);
	}

}
