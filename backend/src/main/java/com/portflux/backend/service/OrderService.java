package com.portflux.backend.service;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.OrderItem;
import com.portflux.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    /**
     * 주문 생성
     * merchantUid 길이를 40자 이하로 생성하여 PG사 결제 시 잘림 방지
     */
    @Transactional
    public Order createOrder(Long userId, List<OrderItem> items) {
        Order order = new Order();
        order.setUserId(userId);

        // 1. 주문번호 생성 로직 수정
        // 형식: ORD + yyyyMMddHHmmss(14자) + UUID 8자리 = 총 25자 (안전함)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomStr = UUID.randomUUID().toString().substring(0, 8);
        String merchantUid = "ORD" + timestamp + "-" + randomStr;

        order.setMerchantUid(merchantUid);

        // 2. 총 금액 계산
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem it : items) {
            order.addItem(it);
            total = total.add(it.getSubtotal());
        }
        order.setTotalAmount(total);
        order.setStatus("CREATED");

        return orderRepository.save(order);
    }

    /**
     * 주문번호(merchantUid)로 주문 조회
     */
    public Order findByMerchantUid(String merchantUid) {
        return orderRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new RuntimeException("해당 주문번호를 찾을 수 없습니다: " + merchantUid));
    }

    /**
     * 주문 상태 업데이트
     */
    @Transactional
    public Order updateOrderStatus(Order order) {
        return orderRepository.save(order);
    }

    /**
     * 사용자별 주문 목록 조회
     */
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}