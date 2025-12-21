package com.portflux.backend.socket;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SocketIOStartup {

    private final SocketIOServer server;
    private final ChatSocketHandler chatSocketHandler;

    @PostConstruct
    public void start() {
        // 이벤트 등록
        chatSocketHandler.register(server);
        // 서버 시작
        server.start();
        System.out.println("[Socket.IO] started");
    }
    //서버종료
    @PreDestroy
    public void stop() {
        server.stop();
        System.out.println("[Socket.IO] stopped");
    }
}
