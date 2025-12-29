package com.atl.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder){
        return chatClientBuilder
                .defaultSystem("You are a general-purpose, helpful, and professional AI assistant. Respond to all queries clearly, politely, and succinctly.")
                .build();
    }
}
