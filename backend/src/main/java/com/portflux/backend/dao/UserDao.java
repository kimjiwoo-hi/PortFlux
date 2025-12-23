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

    public void insertUser(UserRegisterBean userRegisterBean) {
        userMapper.registerUser(userRegisterBean);
    }

    public int checkNicknameExist(String nickname) {
        return userMapper.checkNicknameCount(nickname);
    }

    public UserBean getUserInfo(String email) {
        return userMapper.findUserByEmail(email);
    }
}