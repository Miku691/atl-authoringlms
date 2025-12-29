package com.atl.mcq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AtlMcqServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AtlMcqServiceApplication.class, args);
	}

}