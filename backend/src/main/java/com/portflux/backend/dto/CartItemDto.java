package com.portflux.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long cartId;
    private Long postId;
    private String title;
    private int price;
    private String postFile; // 썸네일 이미지 경로
    private String userNickname; // 판매자 닉네임
}