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
    
    // 4. 이메일 중복체크
    int checkEmailExist(String email);

    Integer findUserNumByUserId(String userId);

    // ✅ 새로 추가되는 메서드들
    UserBean selectUserByNum(Integer userNum);  // userNum으로 사용자 조회
    void updateUserInfo(UserBean user);          // 사용자 정보 수정
    void updateUserImage(UserBean user);         // 프로필 이미지 수정
    void updateUserBanner(UserBean user);        // 배너 이미지 수정
}