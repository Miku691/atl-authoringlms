package com.ims.staff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImsStaffServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImsStaffServiceApplication.class, args);
	}

}
