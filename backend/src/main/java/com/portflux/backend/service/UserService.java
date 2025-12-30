package com.portflux.backend.service;

import com.portflux.backend.api.GoogleApi;
import com.portflux.backend.beans.*;
import com.portflux.backend.mapper.AdminMapper;
import com.portflux.backend.mapper.CompanyUserMapper;
import com.portflux.backend.mapper.UserMapper;
import com.portflux.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
// [추가] 시큐리티 관련 임포트
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AdminMapper adminMapper;
    private final CompanyUserMapper companyUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final GoogleApi googleApi;

    // [추가] UserDetailsService 인터페이스의 필수 구현 메서드
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        UserBean user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId);
        }
        return new org.springframework.security.core.userdetails.User(
            user.getUserId(),
            user.getUserPw(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Transactional
    public void registerUser(UserRegisterBean registerBean) {
        if (isIdDuplicate(registerBean.getUserId())) throw new RuntimeException("이미 사용 중인 아이디입니다.");
        if (isEmailDuplicate(registerBean.getEmail())) throw new RuntimeException("이미 사용 중인 이메일입니다.");
        if (isNicknameDuplicate(registerBean.getNickname())) throw new RuntimeException("이미 사용 중인 닉네임입니다.");
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
                response.put("user", user); // 컨트롤러에서 필요함
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

    public UserBean getUserByEmail(String email) {
        if (email == null) return null;
        return userMapper.findUserByEmail(email.trim());
    }

    public Map<String, Object> processGoogleLogin(String email, String name) {
        Map<String, Object> response = new HashMap<>();
        String trimmedEmail = email.trim();

        UserBean user = userMapper.findUserByEmail(trimmedEmail);
        if (user != null) {
            response.put("isMember", true);
            response.put("user", user);
            response.put("status", "SUCCESS");
            return response;
        }

        CompanyUserBean company = companyUserMapper.findCompanyByEmail(trimmedEmail);
        if (company != null) {
            response.put("isMember", true);
            response.put("company", company);
            response.put("status", "SUCCESS");
            return response;
        }

        response.put("isMember", false);
        response.put("status", "NEW_USER");
        response.put("email", trimmedEmail);
        response.put("name", name);
        return response;
    }

    /**
     * Authorization Code로 구글 로그인 처리
     */
    public Map<String, Object> processGoogleLoginWithCode(String authCode) {
        Map<String, Object> response = new HashMap<>();

        // 1. Authorization Code로 Access Token 받기
        String accessToken = googleApi.getAccessToken(authCode);
        if (accessToken == null) {
            throw new RuntimeException("구글 Access Token 발급 실패");
        }

        // 2. Access Token으로 사용자 정보 가져오기
        Map<String, Object> userInfo = googleApi.getUserInfo(accessToken);
        if (userInfo == null) {
            throw new RuntimeException("구글 사용자 정보 조회 실패");
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");

        // 3. 기존 processGoogleLogin 로직 재사용
        return processGoogleLogin(email, name);
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

    public UserBean getUserByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    @Transactional
    public void updateUserInfo(String userId, UserBean updateUser, boolean updateImage, boolean updateBanner) {
        UserBean user = userRepository.findByUserId(userId);
        if (user == null) throw new RuntimeException("사용자를 찾을 수 없습니다.");

        if (updateUser.getUserName() != null) user.setUserName(updateUser.getUserName());
        if (updateUser.getUserNickname() != null) user.setUserNickname(updateUser.getUserNickname());
        if (updateUser.getUserPhone() != null) user.setUserPhone(updateUser.getUserPhone());
        if (updateUser.getUserEmail() != null) user.setUserEmail(updateUser.getUserEmail());

        if (updateImage) user.setUserImage(updateUser.getUserImage());
        if (updateBanner) user.setUserBanner(updateUser.getUserBanner());

        userRepository.save(user);
    }

    @Transactional
    public void updatePasswordWithVerification(String userId, String currentPassword, String newPassword) {
        UserBean user = userRepository.findByUserId(userId);
        if (user == null) throw new RuntimeException("사용자를 찾을 수 없습니다.");

        // [수정] getUserPassword -> getUserPw 필드명 변경
        if (!passwordEncoder.matches(currentPassword, user.getUserPw())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(newPassword, user.getUserPw())) {
            throw new RuntimeException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        // [수정] setUserPassword -> setUserPw 필드명 변경
        user.setUserPw(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}