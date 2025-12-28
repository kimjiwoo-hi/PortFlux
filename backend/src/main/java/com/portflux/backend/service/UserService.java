package com.portflux.backend.service;

import com.portflux.backend.beans.*;
import com.portflux.backend.mapper.AdminMapper;
import com.portflux.backend.mapper.CompanyUserMapper;
import com.portflux.backend.mapper.UserMapper;
import com.portflux.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AdminMapper adminMapper;
    private final CompanyUserMapper companyUserMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 1. 회원가입
     */
    @Transactional
    public void registerUser(UserRegisterBean registerBean) {
        if (isIdDuplicate(registerBean.getUserId())) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }
        if (isEmailDuplicate(registerBean.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        if (isNicknameDuplicate(registerBean.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }
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
     * 2. 통합 로그인 로직 (USER / ADMIN / COMPANY)
     */
    public Map<String, Object> login(UserLoginBean loginBean, String loginType) {
        Map<String, Object> response = new HashMap<>();
        String inputId = loginBean.getUserId();
        String inputPw = loginBean.getPassword();

        if ("USER".equals(loginType)) {
            UserBean user = userMapper.getUserInfo(inputId);
            if (user != null && passwordEncoder.matches(inputPw, user.getUserPw())) {
                response.put("num", user.getUserNum());
                response.put("id", user.getUserId());
                response.put("name", user.getUserNickname());
                int adminCount = adminMapper.checkAdminExists(user.getUserNum());
                response.put("role", adminCount > 0 ? "ADMIN" : "USER");
                response.put("memberType", "user");
                return response;
            }
        } else if ("COMPANY".equals(loginType)) {
            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(inputId);
            if (company != null && passwordEncoder.matches(inputPw, company.getCompanyPassword())) {
                response.put("num", company.getCompanyNum());
                response.put("id", company.getCompanyId());
                response.put("name", company.getCompanyName());
                response.put("role", "COMPANY");
                response.put("memberType", "company");
                return response;
            }
        }
        throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
    }

    /**
     * 이메일 기반 유저 조회 (소셜 로그인용)
     */
    public UserBean getUserByEmail(String email) {
        if (email == null) return null;
        return userMapper.findUserByEmail(email.trim());
    }

    /**
     * 3. 구글 로그인 결과 처리 (수정 전문)
     * 일반 유저 테이블과 기업 테이블을 모두 뒤져서 가입 여부를 판단합니다.
     */
    public Map<String, Object> processGoogleLogin(String email, String name) {
        Map<String, Object> response = new HashMap<>();
        String trimmedEmail = email.trim();

        // [STEP 1] 일반 유저 테이블(USERS)에서 먼저 검색
        UserBean user = userMapper.findUserByEmail(trimmedEmail);
        if (user != null) {
            response.put("status", "SUCCESS");
            response.put("userNum", user.getUserNum());
            response.put("userId", user.getUserId()); // 실제 DB ID 반환 (404 방지)
            response.put("nickname", user.getUserNickname());
            response.put("email", user.getUserEmail());
            response.put("role", "USER");
            return response;
        }

        // [STEP 2] 일반 유저가 없으면 기업 테이블(COMPANY)에서 검색
        CompanyUserBean company = companyUserMapper.findCompanyByEmail(trimmedEmail);
        if (company != null) {
            response.put("status", "SUCCESS");
            response.put("userNum", company.getCompanyNum());
            response.put("userId", company.getCompanyId()); // 기업 아이디 반환
            response.put("nickname", company.getCompanyName());
            response.put("email", company.getCompanyEmail());
            response.put("role", "COMPANY"); // 기업 권한 부여
            return response;
        }

        // [STEP 3] 둘 다 없으면 신규 가입 유도
        response.put("status", "NEW_USER");
        response.put("email", trimmedEmail);
        response.put("name", name);
        return response;
    }

    public boolean isNicknameDuplicate(String nickname) { 
        return (userMapper.checkNicknameCount(nickname) + companyUserMapper.existsByCompanyName(nickname)) > 0; 
    }
    public boolean isEmailDuplicate(String email) { 
        return (userMapper.checkEmailDuplicate(email) + companyUserMapper.checkCompanyEmailDuplicate(email)) > 0; 
    }
    public boolean isIdDuplicate(String userId) { 
        return (userMapper.checkIdDuplicate(userId) + companyUserMapper.checkCompanyIdDuplicate(userId)) > 0; 
    }

    public UserBean getUserInfo(String userId) { 
        UserBean user = userMapper.getUserInfo(userId); 
        if (user == null) {
            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(userId);
            if (company != null) {
                user = new UserBean();
                if (company.getCompanyNum() != null) {
                    user.setUserNum(company.getCompanyNum().intValue());
                }
                user.setUserId(company.getCompanyId());
                user.setUserNickname(company.getCompanyName());
                user.setUserEmail(company.getCompanyEmail());
            }
        }
        return user;
    }

    public UserBean findByNameAndEmail(String name, String email) { 
        return userMapper.findByNameAndEmail(name, email); 
    }

    @Transactional
    public void updatePassword(String userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(userId, encodedPassword);
    }

    public UserBean getUserInfoByNum(int userNum) {
        return userRepository.findById(userNum).orElse(null);
    }
}