package com.portflux.backend.service;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.GoogleApi;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.dao.UserDao;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserDao userDao;
    private final GoogleApi googleApi;
    private final PasswordEncoder passwordEncoder;

    // --- 1. 일반 회원가입 ---
    @Transactional
    public void registerUser(UserRegisterBean registerBean) {
        // 1. 비밀번호 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());

        // 3. DB용 Bean 생성
        UserBean user = new UserBean();
        user.setUserEmail(registerBean.getEmail());
        user.setUserId(registerBean.getEmail());
        user.setUserPassword(encodedPassword);
        user.setUserNickname(registerBean.getNickname());
        user.setUserPhone(registerBean.getPhoneNumber());

        // 4. 저장
        userDao.insertUser(user);
    }

    // --- 2. 일반 로그인 ---
    public UserBean login(UserLoginBean loginBean) {
        // 1. 이메일로 유저 조회
        UserBean user = userDao.getUserInfo(loginBean.getEmail());
        
        if (user == null) {
            throw new RuntimeException("존재하지 않는 이메일입니다.");
        }

        // 2. 암호화된 비밀번호 비교 (matches 메서드 사용)
        if (!passwordEncoder.matches(loginBean.getPassword(), user.getUserPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return user; // 로그인 성공 시 유저 정보 반환 (나중에 토큰으로 변경 가능)
    }


    // --- 3. 구글 로그인 프로세스 ---
    public UserBean processGoogleLogin(String authCode) {
        // 1. 인증 코드로 액세스 토큰 받기
        String accessToken = googleApi.getAccessToken(authCode);
        if (accessToken == null) {
            throw new RuntimeException("구글 로그인 실패: 토큰을 받아오지 못했습니다.");
        }

        // 2. 토큰으로 유저 정보(이메일 등) 받기
        Map<String, Object> googleInfo = googleApi.getUserInfo(accessToken);
        String email = (String) googleInfo.get("email");
        String name = (String) googleInfo.get("name");

        // 3. 우리 DB에 이메일이 있는지 확인
        UserBean user = userDao.getUserInfo(email);

        if (user == null) {
            // [신규 유저] -> 여기서 바로 가입시키거나, 프론트에 "신규임"을 알려줘서 회원가입 창으로 보내야 함.
            // 현재 기획: "신규면 회원가입 창으로 보냄" -> null 반환하여 컨트롤러가 처리하게 함
            return null; 
        }

        // [기존 유저] -> 로그인 성공 처리
        return user;
    }
}