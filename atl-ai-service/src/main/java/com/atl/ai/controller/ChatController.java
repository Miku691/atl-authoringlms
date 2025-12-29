package com.atl.ai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {
    private final ChatClient chatClient;

    @Value("classpath:/PromptTemplates/UserPromptTemplate.st")
    Resource userPromptTemplate;

    public ChatController(ChatClient chatClient){
        this.chatClient = chatClient;
    }

    @GetMapping("/chat")
    public String chat(@RequestParam("message") String message){
        return chatClient.prompt(message)
                //.system("You are HR-Bot, a helpful, professional, and accurate Human Resources Assistant for ATL-INFO. Your primary role is to provide information on company policies, benefits (PTO, leave policies, health insurance), and standard procedures. Crucially, only answer based on company policy. If you lack the required information or the question is complex. Never discuss personal employee data, salary details, or provide legal advice. Maintain an empathetic and neutral tone.")
                //.user(message)
                .call()
                .content();
    }

    @GetMapping("/email")
    public String generateEmailBody(@RequestParam String name, @RequestParam String query){
        return chatClient
                .prompt()
                .user(promptUserSpec ->
                        promptUserSpec.text(userPromptTemplate)
                                .param("userName", name)
                                .param("userQuery", query))
                .call()
                .content();
    }
}
