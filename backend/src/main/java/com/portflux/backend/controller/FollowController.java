package com.portflux.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.portflux.backend.service.FollowService;

import lombok.RequiredArgsConstructor;

/**
 * [팔로우 컨트롤러]
 * - 로그인한 유저 기준 팔로우/언팔로우 처리
 *
 * ※ 현재는 개발 단계이므로
 *    로그인 유저 user_num을 Request Header로 전달받음
 *    (추후 JWT/Spring Security 적용 시 자동 주입으로 교체 가능)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/follow")
public class FollowController {

    private final FollowService followService;

    /**
     * 팔로우
     * Header : X-USER-NUM (로그인 유저 번호)
     */
    @PostMapping("/{targetUserNum}")
    public ResponseEntity<?> follow(
            @RequestHeader("X-USER-NUM") Long loginUserNum,
            @PathVariable Long targetUserNum) {

        followService.follow(loginUserNum, targetUserNum);
        return ResponseEntity.ok("팔로우 성공");
    }

    /**
     * 언팔로우
     */
    @DeleteMapping("/{targetUserNum}")
    public ResponseEntity<?> unfollow(
            @RequestHeader("X-USER-NUM") Long loginUserNum,
            @PathVariable Long targetUserNum) {

        followService.unfollow(loginUserNum, targetUserNum);
        return ResponseEntity.ok("언팔로우 성공");
    }

    /**
     * 팔로우 여부 확인
     */
    @GetMapping("/is-following/{targetUserNum}")
    public ResponseEntity<?> isFollowing(
            @RequestHeader("X-USER-NUM") Long loginUserNum,
            @PathVariable Long targetUserNum) {

        boolean following = followService.isFollowing(loginUserNum, targetUserNum);
        return ResponseEntity.ok(Map.of("following", following));
    }

    /**
     * 팔로잉 목록 조회
     */
    @GetMapping("/following/{userNum}")
    public ResponseEntity<?> following(@PathVariable Long userNum) {
        return ResponseEntity.ok(Map.of(
                "count", followService.countFollowing(userNum),
                "list", followService.getFollowingList(userNum)
        ));
    }

    /**
     * 팔로워 목록 조회
     */
    @GetMapping("/followers/{userNum}")
    public ResponseEntity<?> followers(@PathVariable Long userNum) {
        return ResponseEntity.ok(Map.of(
                "count", followService.countFollowers(userNum),
                "list", followService.getFollowerList(userNum)
        ));
    }
}
