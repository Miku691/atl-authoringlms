package com.ims.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImsPlatformServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImsPlatformServiceApplication.class, args);
	}

}
