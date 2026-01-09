package com.atl.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AtlAuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AtlAuthServiceApplication.class, args);
	}

}