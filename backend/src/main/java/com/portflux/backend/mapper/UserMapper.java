package com.portflux.backend.mapper;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.beans.UserRegisterBean;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param; // Param 임포트 필수

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
    UserBean findUserByEmail(String email);
    UserBean getUserInfo(String userId);

    // ★ [핵심 추가] 비밀번호 변경 (파라미터 2개 이상일 때 @Param 필수)
    void updatePassword(@Param("userId") String userId, @Param("newPassword") String newPassword);
}