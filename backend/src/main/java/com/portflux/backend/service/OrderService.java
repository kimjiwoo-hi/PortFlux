package com.portflux.backend.service;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.OrderItem;
import com.portflux.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    public Order createOrder(Long userId, List<OrderItem> items) {
        Order order = new Order();
        order.setUserId(userId);
        String merchantUid = "order-" + UUID.randomUUID();
        order.setMerchantUid(merchantUid);
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem it : items) {
            order.addItem(it);
            total = total.add(it.getSubtotal());
        }
        order.setTotalAmount(total);
        order.setStatus("CREATED");
        return orderRepository.save(order);
    }

    public Order findByMerchantUid(String merchantUid) {
        return orderRepository.findByMerchantUid(merchantUid).orElse(null);
    }

    public Order updateOrderStatus(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}