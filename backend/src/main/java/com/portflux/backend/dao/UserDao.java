package com.portflux.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.mapper.UserMapper;

@Repository
public class UserDao {

    @Autowired
    private UserMapper userMapper;

    // 회원가입
    public void insertUser(UserBean userBean) {
        userMapper.insertUser(userBean);
    }

    // 이메일로 유저 정보 가져오기
    public UserBean getUserInfo(String email) {
        return userMapper.findUserByEmail(email);
    }

    // 닉네임 중복 확인 (true: 중복됨, false: 사용가능)
    public boolean checkNickname(String nickname) {
        return userMapper.checkNicknameExist(nickname) > 0;
    }

    // 이메일 중복 확인
    public boolean checkEmail(String email) {
        return userMapper.checkEmailExist(email) > 0;
    }
}