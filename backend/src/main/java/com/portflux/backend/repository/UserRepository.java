
package com.portflux.backend.repository;

import com.portflux.backend.beans.UserBean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserBean, Long> {

    // 1. 이메일 존재 여부 확인 (회원가입 시 중복체크)
    boolean existsByUserEmail(String userEmail);

    // 2. ★ 아이디 존재 여부 확인 (회원가입 시 중복체크)
    boolean existsByUserId(String userId);

    // 3. ★ 아이디로 유저 정보 조회 (로그인 시 사용)
    UserBean findByUserId(String userId);

    // 4. 이메일로 유저 정보 조회 (구글 로그인 등)
    UserBean findByUserEmail(String userEmail);

    // 5. ★ 이름과 이메일로 유저 조회 (아이디 찾기 기능용)
    UserBean findByUserNameAndUserEmail(String userName, String userEmail);

    boolean existsByUserNicknameIgnoreCase(String userNickname);
}
