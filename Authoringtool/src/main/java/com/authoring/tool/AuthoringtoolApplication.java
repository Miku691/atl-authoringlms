package com.authoring.tool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AuthoringtoolApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthoringtoolApplication.class, args);
	}

}
