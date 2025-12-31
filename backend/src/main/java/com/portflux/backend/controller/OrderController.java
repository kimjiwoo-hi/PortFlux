package com.portflux.backend.controller;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.OrderItem;
import com.portflux.backend.service.OrderService;
import com.portflux.backend.repository.UserRepository;
import com.portflux.backend.beans.UserBean;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateOrderRequest req) {
        UserBean user = userRepository.findByUserId(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        List<OrderItem> items = req.getItems().stream().map(i -> {
            OrderItem it = new OrderItem();
            it.setProductId(i.getProductId());
            it.setProductName(i.getProductName());
            it.setUnitPrice(i.getUnitPrice());
            it.setQty(i.getQty());
            return it;
        }).collect(Collectors.toList());

        Order order = orderService.createOrder(Long.valueOf(user.getUserNum()), items);

        CreateOrderResponse res = new CreateOrderResponse();
        res.setOrderId(order.getId());
        res.setMerchantUid(order.getMerchantUid());
        res.setAmount(order.getTotalAmount());

        return ResponseEntity.ok(res);
    }

    @Data
    public static class CreateOrderRequest {
        private List<CreateItem> items;
    }

    @Data
    public static class CreateItem {
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
    }

    @Data
    public static class CreateOrderResponse {
        private Long orderId;
        private String merchantUid;
        private BigDecimal amount;
    }

    /**
     * merchantUid로 주문 정보 조회 (결제 페이지용)
     */
    @GetMapping("/{merchantUid}")
    public ResponseEntity<OrderDetailResponse> getOrderByMerchantUid(
            @PathVariable String merchantUid,
            @AuthenticationPrincipal UserDetails userDetails) {

        Order order = orderService.findByMerchantUid(merchantUid);

        if (order == null) {
            return ResponseEntity.status(404).build();
        }

        // 현재 로그인한 사용자 조회
        UserBean user = userRepository.findByUserId(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 주문자 검증 (본인의 주문만 조회 가능)
        if (!order.getUserId().equals(Long.valueOf(user.getUserNum()))) {
            return ResponseEntity.status(403).build();
        }

        // 주문 상품 목록 변환
        List<OrderItemDetail> itemDetails = order.getItems().stream()
                .map(item -> {
                    OrderItemDetail detail = new OrderItemDetail();
                    detail.setProductId(item.getProductId());
                    detail.setProductName(item.getProductName());
                    detail.setUnitPrice(item.getUnitPrice());
                    detail.setQty(item.getQty());
                    return detail;
                })
                .collect(Collectors.toList());

        // 응답 객체 생성
        OrderDetailResponse response = new OrderDetailResponse();
        response.setMerchantUid(order.getMerchantUid());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setItems(itemDetails);
        response.setBuyerName(user.getUserNickname());
        response.setBuyerEmail(user.getUserId()); // 이메일로 사용
        response.setBuyerTel(user.getUserPhone() != null ? user.getUserPhone() : "010-0000-0000");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        UserBean user = userRepository.findByUserId(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        List<Order> orders = orderService.getOrdersByUserId(Long.valueOf(user.getUserNum()));

        List<OrderResponse> responses = orders.stream()
                .map(order -> {
                    OrderResponse res = new OrderResponse();
                    res.setId(order.getId());
                    res.setUserId(order.getUserId());
                    res.setMerchantUid(order.getMerchantUid());
                    res.setTotalAmount(order.getTotalAmount());
                    res.setStatus(order.getStatus());
                    res.setCreatedAt(order.getCreatedAt());

                    List<OrderItemResponse> itemResponses = order.getItems().stream()
                            .map(item -> {
                                OrderItemResponse itemRes = new OrderItemResponse();
                                itemRes.setProductId(item.getProductId());
                                itemRes.setProductName(item.getProductName());
                                itemRes.setUnitPrice(item.getUnitPrice());
                                itemRes.setQty(item.getQty());
                                return itemRes;
                            })
                            .collect(Collectors.toList());

                    res.setItems(itemResponses);
                    return res;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private Long userId;
        private String merchantUid;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;
    }

    @Data
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
    }

    @Data
    public static class OrderDetailResponse {
        private String merchantUid;
        private BigDecimal totalAmount;
        private String status;
        private List<OrderItemDetail> items;
        private String buyerName;
        private String buyerEmail;
        private String buyerTel;
    }

    @Data
    public static class OrderItemDetail {
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
    }
}