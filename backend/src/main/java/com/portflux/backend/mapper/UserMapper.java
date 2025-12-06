package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.portflux.backend.beans.UserBean;

@Mapper
public interface UserMapper {
    void insertUser(UserBean userBean);

    UserBean findUserByEmail(String email);

    int checkNicknameExist(String nickname);

    int checkEmailExist(String email);
}