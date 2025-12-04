package org.minhtrinh.eventease251.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.CreateOrderRequest;
import org.minhtrinh.eventease251.dto.ErrorResponse;
import org.minhtrinh.eventease251.dto.OrderDTO;
import org.minhtrinh.eventease251.service.OrderService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * Create a new order
     * Only authenticated participants can create orders
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_PARTICIPANT')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            // Get the current authenticated user's ID from the security context
            Long userId = JwtTokenProvider.getAuthenticatedUserId();
            
            log.info("OrderController: Creating order for user ID: {}", userId);
            OrderDTO orderDTO = orderService.createOrder(request, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
        } catch (RuntimeException e) {
            log.error("OrderController: Error creating order", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get all orders for the authenticated user
     * Returns orders with tickets and event details for My Tickets page
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('ROLE_PARTICIPANT')")
    public ResponseEntity<?> getMyOrders() {
        try {
            Long userId = JwtTokenProvider.getAuthenticatedUserId();
            
            log.info("OrderController: Fetching orders for user ID: {}", userId);
            List<OrderDTO> orders = orderService.getMyOrders(userId);
            
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            log.error("OrderController: Error fetching orders", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
