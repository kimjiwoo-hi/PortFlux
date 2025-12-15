package com.portflux.backend.dao;

import org.springframework.stereotype.Repository;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserDao {

    private final UserMapper userMapper;

    // 1. 회원가입: Service에서 RegisterBean을 받아 Mapper로 넘김
    public void insertUser(UserRegisterBean userRegisterBean) {
        userMapper.registerUser(userRegisterBean);
    }

    // 2. 닉네임 중복 확인
    public int checkNicknameExist(String nickname) {
        return userMapper.checkNicknameCount(nickname);
    }

    // 3. 로그인 정보 조회
    public UserBean getUserInfo(String email) {
        return userMapper.findUserByEmail(email);
    }
}