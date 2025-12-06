package com.portflux.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/register")
@RequiredArgsConstructor
public class UserRegisterController {

    private final UserService userService;

    // 일반 회원가입 요청
    @PostMapping("/general")
    public ResponseEntity<String> registerGeneral(@RequestBody UserRegisterBean registerBean) {
        try {
            userService.registerUser(registerBean);
            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}