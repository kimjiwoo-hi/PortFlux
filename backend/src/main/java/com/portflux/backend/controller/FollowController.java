package com.portflux.backend.controller;

import com.portflux.backend.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/follow")
    public ResponseEntity<Void> follow(@RequestBody Map<String, Long> payload) {
        Long followerId = payload.get("followerId");
        Long followingId = payload.get("followingId");
        followService.followUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfollow")
    public ResponseEntity<Void> unfollow(@RequestBody Map<String, Long> payload) {
        Long followerId = payload.get("followerId");
        Long followingId = payload.get("followingId");
        followService.unFollowUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<Long>> getFollowing(@PathVariable("userId") Long userId) {
        List<Long> followingList = followService.getFollowingList(userId);
        return ResponseEntity.ok(followingList);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<Long>> getFollowers(@PathVariable("userId") Long userId) {
        List<Long> followerList = followService.getFollowersList(userId);
        return ResponseEntity.ok(followerList);
    }
}
