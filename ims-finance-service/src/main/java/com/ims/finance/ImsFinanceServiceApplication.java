package com.ims.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImsFinanceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImsFinanceServiceApplication.class, args);
	}

}
