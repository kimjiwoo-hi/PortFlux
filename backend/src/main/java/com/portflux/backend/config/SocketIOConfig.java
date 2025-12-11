package com.portflux.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.corundumstudio.socketio.SocketIOServer;


@Configuration
public class SocketIOConfig {
    
    @Value("${socket-server.host:localhost}")// Socket.IO 서버 호스트
    private String host;

    @Value("${socket-server.port:8080}")// Socket.IO 임시 서버 포트
    private int port;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);
        config.setOrigin("*");
        return new SocketIOServer(config);
    }



}
