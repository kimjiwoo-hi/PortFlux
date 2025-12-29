package com.portflux.backend.mapper;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.beans.UserRegisterBean;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    // 회원가입 & 로그인
    void registerUser(UserRegisterBean registerBean);
    UserBean login(UserLoginBean loginBean);

    // 중복 확인
    int checkIdDuplicate(String userId);
    int checkNicknameCount(String nickname);
    int checkNicknameDuplicate(String nickname);
    int checkEmailDuplicate(String email);

    // 유저 찾기
    UserBean findByNameAndEmail(@Param("userName") String userName, @Param("userEmail") String userEmail);
    
    // [수정] 이메일로 유저 정보를 조회하는 메서드 (구글 로그인용)
    UserBean findUserByEmail(@Param("email") String email);
    
    UserBean getUserInfo(String userId);

    // 비밀번호 변경
    void updatePassword(@Param("userId") String userId, @Param("newPassword") String newPassword);
}