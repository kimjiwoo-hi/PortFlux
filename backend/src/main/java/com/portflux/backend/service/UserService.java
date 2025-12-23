package com.portflux.backend.service;

import com.portflux.backend.beans.AdminBean;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.mapper.AdminMapper;
import com.portflux.backend.mapper.UserMapper;
import com.portflux.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository; // JPA (일반유저 저장)
    
    @Autowired
    private UserMapper userMapper;         // MyBatis (일반유저 조회)
    
    @Autowired
    private AdminMapper adminMapper;       // MyBatis (관리자 여부 확인용)
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 1. 회원가입
     */
    @Transactional
    public void registerUser(UserRegisterBean registerBean) {
        if (registerBean.getPassword() == null || !registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());
        
        UserBean user = new UserBean();
        user.setUserId(registerBean.getUserId());
        user.setUserEmail(registerBean.getEmail());
        user.setUserPw(encodedPassword);
        user.setUserName(registerBean.getName());
        user.setUserNickname(registerBean.getNickname());
        user.setUserPhone(registerBean.getPhoneNumber());
        user.setUserLevel(1);

        userRepository.save(user);
    }

    /**
     * 2. 통합 로그인 로직
     */
    public Map<String, Object> login(UserLoginBean loginBean) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("### [Login Attempt] ID: " + loginBean.getUserId());

        // A. 모든 사용자는 USERS 테이블에서 먼저 인증합니다.
        UserBean user = userMapper.getUserInfo(loginBean.getUserId());
        
        if (user != null && passwordEncoder.matches(loginBean.getPassword(), user.getUserPw())) {
            response.put("userNum", user.getUserNum());
            response.put("userId", user.getUserId());
            response.put("userNickname", user.getUserNickname());
            
            // B. [핵심] 인증 성공 후, 이 유저가 관리자 권한 테이블에 있는지 확인합니다.
            // adminMapper.checkAdminExists(userNum)은 존재하면 1, 없으면 0 반환
            int adminCount = adminMapper.checkAdminExists(user.getUserNum());
            
            if (adminCount > 0) {
                response.put("role", "ADMIN");
                System.out.println("=> 관리자 로그인 성공: " + user.getUserNickname());
            } else {
                response.put("role", "USER");
                System.out.println("=> 일반 유저 로그인 성공: " + user.getUserNickname());
            }
            
            return response;
        }

        throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
    }

    public boolean isNicknameDuplicate(String nickname) { return userMapper.checkNicknameCount(nickname) > 0; }
    public boolean isEmailDuplicate(String email) { return userMapper.checkEmailDuplicate(email) > 0; }
    public boolean isIdDuplicate(String userId) { return userMapper.checkIdDuplicate(userId) > 0; }
    public UserBean getUserInfo(String userId) { return userMapper.getUserInfo(userId); }
    public UserBean findByNameAndEmail(String name, String email) { return userMapper.findByNameAndEmail(name, email); }
    public Map<String, Object> processGoogleLogin(String authCode) { return new HashMap<>(); }

    @Transactional
    public void updatePassword(String userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(userId, encodedPassword);
    }

    public UserBean getUserInfoByNum(int userNum) {
        return userRepository.findById(userNum).orElse(null);
    }
}