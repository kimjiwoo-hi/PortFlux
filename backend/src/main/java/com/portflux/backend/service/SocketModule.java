package com.portflux.backend.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.repository.OrderRepository;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

@Slf4j  //로그 기능 추가
@Component
public class SocketModule implements CommandLineRunner{

    private final OrderRepository orderRepository;
    private final SocketIOServer server;

    @Override
    public void run(String... args) throws Exception {
        server.start();
        log.info("Socket.IO 서버가 시작되었습니다.");
    }

    public SocketModule(SocketIOServer server, OrderRepository orderRepository) {
        this.server = server;
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.addEventListener("joinRoom", String.class, onJoinRoom());
        server.addEventListener("chatMessage", ChatMessageBean.class, onChatMessage());
        this.orderRepository = orderRepository;
    }

    // 이용자가 방에 연결 시
    private DataListener<String> onJoinRoom() {
        return (client, roomName, ackSender) -> {
            client.joinRoom(roomName);
            log.info("Socket ID : "+client.getSessionId().toString()+"님이 "+roomName+"에 입장하였습니다.");
            client.joinRoom(roomName);
        };
    }

    // 이용자가 채팅 메시지 전송 시
    private DataListener<ChatMessageBean> onChatMessage() {
        return (client, data, ackSender) -> {
            log.info(data.getSenderNum() + "님이"+ data.getContent()+"메시지를 전송하였습니다.");
            // 해당 방에 메시지 브로드캐스트
            String roomName = data.getRoomId().toString();
            server.getRoomOperations(roomName).sendEvent("chatMessage", data);
        };
    }

    //이용자 연결 시
    private ConnectListener onConnected(){
        return client -> {
            log.info("Socket ID : "+client.getSessionId().toString()+"님이 연결되었습니다.");
        };
    }

    //이용자 연결 해제 시
    private DisconnectListener onDisconnected(){
        return client -> {
            log.info("Socket ID : "+client.getSessionId().toString()+"님이 연결을 해제하였습니다.");
        };
    }

    @PreDestroy
    public void stopServer(){
        server.stop();
        log.info("Socket.IO 서버가 종료되었습니다.");
    }
    
}