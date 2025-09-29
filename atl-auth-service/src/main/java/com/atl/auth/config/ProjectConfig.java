package com.atl.auth.config;

import ch.qos.logback.core.model.Model;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProjectConfig {

    @Bean
    ModelMapper modelMapper(ModelMapper modelMapper){
        return new ModelMapper();
    }
}
