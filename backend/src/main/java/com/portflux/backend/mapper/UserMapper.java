package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserRegisterBean;

@Mapper
public interface UserMapper {
    // 1. 회원가입 (XML id="registerUser"와 일치, 파라미터는 RegisterBean)
    void registerUser(UserRegisterBean userRegisterBean);

    // 2. 닉네임 중복확인 (XML id="checkNicknameCount"와 일치)
    int checkNicknameCount(String nickname);

    // 3. 로그인용
    UserBean findUserByEmail(String email);
    
    // 4. 이메일 중복체크
    int checkEmailExist(String email);

    Integer findUserNumByUserId(String userId);
}