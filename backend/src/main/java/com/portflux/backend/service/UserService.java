package com.portflux.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.GoogleApi;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleApi googleApi;

    // 1. 회원가입
    @Transactional
    public void registerUser(UserRegisterBean registerBean) {
        // 비밀번호 일치 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());

        // Entity 생성 및 저장
        UserBean user = new UserBean();
        user.setUserId(registerBean.getUserId());         // 아이디 저장
        user.setUserEmail(registerBean.getEmail());       // 이메일 저장
        user.setUserPassword(encodedPassword);
        user.setUserName(registerBean.getName());
        user.setUserNickname(registerBean.getNickname());
        user.setUserPhone(registerBean.getPhoneNumber());
        user.setUserLevel(1); // 기본 레벨

        userRepository.save(user);
    }

    // 2. 닉네임 중복 확인
    public boolean isNicknameAvailable(String nickname) {
        // 닉네임 중복 체크 로직 (Repository에 메서드가 없으면 추가 필요)
        // 임시로 true 반환 (실제 구현 시: !userRepository.existsByUserNickname(nickname))
        return true; 
    }

    // 3. 로그인 (아이디로 로그인)
    public UserBean login(UserLoginBean loginBean) {
        // 아이디로 조회
        UserBean user = userRepository.findByUserId(loginBean.getUserId());

        if (user == null) {
            throw new RuntimeException("존재하지 않는 아이디입니다.");
        }
        if (!passwordEncoder.matches(loginBean.getPassword(), user.getUserPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        return user;
    }

    // 4. ★ [수정] 구글 로그인 프로세스 (리턴 타입 변경: UserBean -> Map)
    // 이유: 회원이 아닐 경우에도 구글 정보(이메일, 이름)를 컨트롤러에 전달해야 함
    public Map<String, Object> processGoogleLogin(String authCode) {
        String accessToken = googleApi.getAccessToken(authCode);
        if (accessToken == null)
            throw new RuntimeException("구글 로그인 실패: 토큰 발급 오류");

        Map<String, Object> googleInfo = googleApi.getUserInfo(accessToken);
        String email = (String) googleInfo.get("email");
        String name = (String) googleInfo.get("name");

        // DB에서 이메일로 유저 조회
        UserBean user = userRepository.findByUserEmail(email);
        
        // 결과 맵 생성
        Map<String, Object> result = new HashMap<>();
        
        if (user != null) {
            // 이미 가입된 유저 -> 유저 정보 리턴
            result.put("user", user);
            result.put("isMember", true);
        } else {
            // 미가입 유저 -> 구글에서 받아온 정보만 리턴 (회원가입 프리셋 용도)
            result.put("email", email);
            result.put("name", name);
            result.put("isMember", false);
        }
        
        return result;
    }

    // 5. 이메일 중복 확인
    public boolean isEmailDuplicate(String email) {
        return userRepository.existsByUserEmail(email);
    }

    // 6. 아이디 중복 확인 메서드
    public boolean isIdDuplicate(String userId) {
        return userRepository.existsByUserId(userId);
    }

    // 7. 아이디 찾기 (이름 + 이메일로 조회)
    public UserBean findByNameAndEmail(String name, String email) {
        return userRepository.findByUserNameAndUserEmail(name, email);
    }

    // 8. 비밀번호 변경
    @Transactional
    public void updatePassword(String userId, String newPassword) {
        UserBean user = userRepository.findByUserId(userId);
        
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        // 이전 비밀번호와 일치하는지 확인
        if (passwordEncoder.matches(newPassword, user.getUserPassword())) {
            throw new RuntimeException("이전 비밀번호로는 변경할 수 없습니다.");
        }

        // 새 비밀번호 암호화 후 저장
        user.setUserPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}