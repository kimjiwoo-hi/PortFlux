package com.portflux.backend.controller;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.OrderItem;
import com.portflux.backend.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest req) {
        // TODO: 현재는 인증 없이 userId를 request에서 받습니다. 실제로는 인증정보 사용 권장.
        Long userId = req.getUserId();

        List<OrderItem> items = req.getItems().stream().map(i -> {
            OrderItem it = new OrderItem();
            it.setProductId(i.getProductId());
            it.setProductName(i.getProductName());
            it.setUnitPrice(i.getUnitPrice());
            it.setQty(i.getQty());
            return it;
        }).collect(Collectors.toList());

        Order order = orderService.createOrder(userId, items);

        CreateOrderResponse res = new CreateOrderResponse();
        res.setOrderId(order.getId());
        res.setMerchantUid(order.getMerchantUid());
        res.setAmount(order.getTotalAmount());

        return ResponseEntity.ok(res);
    }

    @Data
    public static class CreateOrderRequest {
        private Long userId;
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable("userId") Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);

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
}