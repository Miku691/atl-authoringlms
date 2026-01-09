package com.ims.academic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImsAcademicServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImsAcademicServiceApplication.class, args);
	}

}
