package com.example.talent_grid.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Core WebSocket endpoint used by frontend to initialize real-time session
        registry.addEndpoint("/ws-editor")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Destinations prefix where the server sends broadcasts
        registry.enableSimpleBroker("/topic");
        // Destinations prefix where clients send typing and cursor messages
        registry.setApplicationDestinationPrefixes("/app");
    }
}
