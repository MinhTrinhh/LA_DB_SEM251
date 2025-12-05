package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.CreateOrderRequest;
import org.minhtrinh.eventease251.dto.OrderDTO;
import org.minhtrinh.eventease251.dto.TicketDTO;
import org.minhtrinh.eventease251.dto.TicketCategoryDTO;
import org.minhtrinh.eventease251.dto.EventDTO;
import org.minhtrinh.eventease251.dto.PaymentMethodDTO;
import org.minhtrinh.eventease251.entity.*;
import org.minhtrinh.eventease251.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaidByRepository paidByRepository;
    private final QRCodeService qrCodeService;
    private final TicketQRCodeService ticketQRCodeService;
    private final PaymentMethodService paymentMethodService;
    /**
     * Create a new order with tickets
     * Validates user is a participant and creates order with tickets transactionally
     */
    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, Long userId) {
        log.info("OrderService: Creating order for user ID: {}", userId);
        
        // Validate that the user exists and has participant profile
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        if (user.getParticipantProfile() == null) {
            throw new RuntimeException("User must complete participant profile before booking tickets");
        }
        
        // Build SessionId for composite key lookup
        SessionId sessionId = new SessionId();
        sessionId.setSessionId(request.getSessionId());
        sessionId.setEvent(request.getEventId());
        
        // Validate session exists
        sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Calculate total amount and validate ticket categories
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<TicketCategory> ticketCategories = new ArrayList<>();
        
        for (Map.Entry<Long, Integer> entry : request.getTicketQuantities().entrySet()) {
            Long categoryId = entry.getKey();
            Integer quantity = entry.getValue();
            
            if (quantity <= 0) {
                throw new RuntimeException("Ticket quantity must be greater than 0 for category ID: " + categoryId);
            }
            
            TicketCategory category = ticketCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Ticket category not found with ID: " + categoryId));
            
            // Verify category belongs to the session  
            if (!category.getSession().getSessionId().equals(request.getSessionId())) {
                throw new RuntimeException("Ticket category " + categoryId + " does not belong to session " + request.getSessionId());
            }
            
            // Check if enough tickets are available
            Long soldTickets = ticketRepository.countByCategory_CategoryId(categoryId);
            log.info("Validation for category '{}' (ID: {}): maximum_slot={}, sold={}, requested={}, available={}",
                    category.getCategoryName(), categoryId, category.getMaximumSlot(), soldTickets, quantity, 
                    (category.getMaximumSlot() - soldTickets));
            
            if (soldTickets + quantity > category.getMaximumSlot()) {
                String errorMsg = String.format(
                    "Not enough tickets available for category '%s'. Maximum: %d, Already sold: %d, Requested: %d, Available: %d",
                    category.getCategoryName(), category.getMaximumSlot(), soldTickets, quantity, 
                    (category.getMaximumSlot() - soldTickets)
                );
                log.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }
            
            ticketCategories.add(category);
            BigDecimal categoryTotal = category.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(categoryTotal);
        }
        
        // Create order
        Order order = new Order();

        // For free tickets (amount = 0), automatically mark as PAID
        // Otherwise, set to AWAITING_PAYMENT
        if (totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            order.setOrderStatus(OrderStatus.PAID);
            log.info("OrderService: Free order (amount = 0) - automatically marking as PAID");
        } else {
            order.setOrderStatus(OrderStatus.AWAITING_PAYMENT);
            log.info("OrderService: Paid order (amount = {}) - status set to AWAITING_PAYMENT", totalAmount);
        }

        order.setCurrency(OrderCurrency.valueOf(request.getCurrency())); // Convert String to enum
        order.setAmountOfMoney(totalAmount);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Set participant profile reference
        if (user.getParticipantProfile() == null) {
            throw new RuntimeException("User must have a participant profile to create an order");
        }
        order.setParticipantProfile(user.getParticipantProfile());

        Order savedOrder = orderRepository.save(order);
        log.info("OrderService: Created order with ID: {} with status: {}",
                savedOrder.getOrderId(), savedOrder.getOrderStatus());

        // Generate payment QR code and create PaidBy record only for paid orders
        PaidBy paidBy = null;
        if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            paidBy = createPaymentRecord(savedOrder, request.getPaymentMethodId());
            log.info("OrderService: Payment QR code generated: {}", paidBy.getQrCodeUrl());
        } else {
            log.info("OrderService: Skipping payment QR code for free order");
        }

        // Create tickets for the order - each ticket gets unique validation QR code
        List<Ticket> tickets = new ArrayList<>();
        int ticketIndex = 0;
        for (Map.Entry<Long, Integer> entry : request.getTicketQuantities().entrySet()) {
            Long categoryId = entry.getKey();
            Integer quantity = entry.getValue();
            
            TicketCategory category = ticketCategories.stream()
                    .filter(c -> c.getCategoryId().equals(categoryId))
                    .findFirst()
                    .orElseThrow();
            
            for (int i = 0; i < quantity; i++) {
                Ticket ticket = new Ticket();
                ticket.setOrder(savedOrder);
                ticket.setCategory(category);
                ticket.setUsedFlag(false);
                
                // Generate unique ticket QR code for validation/check-in using TicketQRCodeService
                // This QR code is stored in ticketqr directory and used for event entrance validation
                String ticketQrCodeUrl = ticketQRCodeService.generateTicketQRCode(
                    savedOrder.getOrderId(),
                    categoryId,
                    ticketIndex
                );
                ticket.setQrCodeUrl(ticketQrCodeUrl);
                ticket.setCreatedAt(LocalDateTime.now());
                ticket.setUpdatedAt(LocalDateTime.now());

                tickets.add(ticket);
                ticketIndex++;
            }
        }
        
        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        log.info("OrderService: Created {} tickets for order {} with unique validation QR codes",
                savedTickets.size(), savedOrder.getOrderId());

        // Note: We don't need to manually decrease maximum_slot here
        // The database trigger (trg_ValidateTicketAvailability) automatically validates
        // that we haven't exceeded capacity by counting tickets against maximum_slot
        // Available tickets = maximum_slot - COUNT(tickets for this category)

        // Log ticket sales for each category
        for (Map.Entry<Long, Integer> entry : request.getTicketQuantities().entrySet()) {
            Long categoryId = entry.getKey();
            Integer quantity = entry.getValue();
            
            TicketCategory category = ticketCategories.stream()
                    .filter(c -> c.getCategoryId().equals(categoryId))
                    .findFirst()
                    .orElseThrow();
            
            // Count currently sold tickets for this category
            long soldCount = ticketRepository.countByCategory_CategoryId(categoryId);
            long availableCount = category.getMaximumSlot() - soldCount;

            log.info("OrderService: Sold {} tickets for category {} (ID: {}). Total sold: {}, Available: {} / {}",
                    quantity, category.getCategoryName(), categoryId, soldCount, availableCount, category.getMaximumSlot());
        }

        // Convert to DTO
        return convertToOrderDTO(savedOrder, savedTickets);
    }
    
    /**
     * Get all orders for the current user
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(Long userId) {
        log.info("OrderService: Fetching orders for user ID: {}", userId);
        
        List<Order> orders = orderRepository.findOrdersWithTicketsAndEventByUserId(userId);
        
        return orders.stream()
                .map(this::convertToOrderDTOWithEvent)
                .collect(Collectors.toList());
    }
    
    /**
     * Confirm payment for an order (manual confirmation)
     * Updates order status from AWAITING_PAYMENT to PAID
     */
    @Transactional
    public OrderDTO confirmPayment(Long orderId, Long userId) {
        log.info("Confirming payment for order {} by user {}", orderId, userId);

        // Find order and verify ownership
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Verify order belongs to user
        if (!order.getParticipantProfile().getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Order does not belong to user");
        }

        // Verify order is in AWAITING_PAYMENT status
        if (order.getOrderStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new RuntimeException("Order is not in AWAITING_PAYMENT status. Current status: " + order.getOrderStatus());
        }

        // Update order status to PAID
        order.setOrderStatus(OrderStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        log.info("Order {} status updated to PAID", orderId);

        // Return updated order
        return convertToOrderDTOWithEvent(savedOrder);
    }

    /**
     * Cancel an order (for organizer or admin)
     * Updates order status to CANCELED and deletes QR code
     */
    @Transactional
    public void cancelOrder(Long orderId) {
        log.info("Cancelling order {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Only allow cancellation if not already paid
        if (order.getOrderStatus() == OrderStatus.PAID) {
            throw new RuntimeException("Cannot cancel a paid order. Please process refund instead.");
        }

        // Update order status
        order.setOrderStatus(OrderStatus.CANCELED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Delete QR code if exists
        paidByRepository.findByOrderId(orderId).ifPresent(paidBy -> {
            if (paidBy.getQrCodeUrl() != null) {
                qrCodeService.deleteQRCode(paidBy.getQrCodeUrl());
            }
        });

        log.info("Order {} cancelled successfully", orderId);
    }

    /**
     * Create payment record with QR code for the order
     */
    private PaidBy createPaymentRecord(Order order, Long paymentMethodId) {
        log.info("Creating payment record for order {}", order.getOrderId());

        // Validate order ID is not null
        if (order.getOrderId() == null) {
            throw new RuntimeException("Order ID is null - order must be saved before creating payment record");
        }

        // Validate payment method exists
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found with ID: " + paymentMethodId));

        // Generate payment QR code if amount > 0
        String qrCodeUrl = null;
        if (order.getAmountOfMoney().compareTo(BigDecimal.ZERO) > 0) {
            String description = qrCodeService.generatePaymentDescription(order.getOrderId());
            qrCodeUrl = qrCodeService.generateVietQRCode(
                order.getOrderId(),
                order.getAmountOfMoney(),
                description
            );
            log.info("Generated payment QR code for order {}: {}", order.getOrderId(), qrCodeUrl);
        } else {
            log.info("Order {} has zero amount, skipping QR code generation", order.getOrderId());
        }

        // Create PaidBy record with explicit orderId
        PaidBy paidBy = new PaidBy();
        paidBy.setOrderId(order.getOrderId()); // Explicitly set the ID
        paidBy.setPaymentMethod(paymentMethod);
        paidBy.setQrCodeUrl(qrCodeUrl);
        paidBy.setTimestamp(LocalDateTime.now());

        // Don't set the order relationship here as it's mapped with insertable=false, updatable=false

        PaidBy savedPaidBy = paidByRepository.save(paidBy);
        log.info("Created payment record for order {} with transaction ID: {}",
                order.getOrderId(), savedPaidBy.getTransactionId());

        return savedPaidBy;
    }


    /**
     * Convert Order entity to OrderDTO (without event details)
     */
    private OrderDTO convertToOrderDTO(Order order, List<Ticket> tickets) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderStatus(order.getOrderStatus().name()); // Convert enum to String
        dto.setCurrency(order.getCurrency().name()); // Convert enum to String
        dto.setAmountOfMoney(order.getAmountOfMoney());
        dto.setUserId(order.getParticipantProfile().getUser().getUserId());

        // Get user name from participant profile
        String userName = order.getParticipantProfile().getFullName() != null
            ? order.getParticipantProfile().getFullName()
            : "User";
        dto.setUserName(userName);
        dto.setUserEmail(order.getParticipantProfile().getUser().getEmailAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Convert tickets
        List<TicketDTO> ticketDTOs = tickets.stream()
                .map(this::convertToTicketDTO)
                .collect(Collectors.toList());
        dto.setTickets(ticketDTOs);
        
        // Get payment information from PaidBy
        paidByRepository.findByOrderId(order.getOrderId()).ifPresent(paidBy -> {
            dto.setQrCodeUrl(paidBy.getQrCodeUrl());
            dto.setPaymentDescription(qrCodeService.generatePaymentDescription(order.getOrderId()));

            // Convert payment method to DTO
            PaymentMethod pm = paidBy.getPaymentMethod();
            if (pm != null) {
                PaymentMethodDTO pmDto = paymentMethodService.convertToDTO(pm);
                dto.setPaymentMethod(pmDto);
            }
        });

        return dto;
    }
    
    /**
     * Convert Order entity to OrderDTO with full event details (for My Tickets page)
     */
    private OrderDTO convertToOrderDTOWithEvent(Order order) {
        OrderDTO dto = convertToOrderDTO(order, order.getTickets());
        
        // Add event details from the first ticket's session
        if (!order.getTickets().isEmpty()) {
            Ticket firstTicket = order.getTickets().get(0);
            Session session = firstTicket.getCategory().getSession();
            
            EventDTO eventDTO = new EventDTO();
            eventDTO.setEventId(session.getEvent().getEventId());
            eventDTO.setTitle(session.getEvent().getTitle());
            eventDTO.setGeneralIntroduction(session.getEvent().getGeneralIntroduction());
            eventDTO.setEventStatus(session.getEvent().getEventStatus());
            eventDTO.setOrganizerId(session.getEvent().getOrganizerProfile().getUser().getUserId());
            eventDTO.setStartDateTime(session.getEvent().getStartDateTime());
            eventDTO.setEndDateTime(session.getEvent().getEndDateTime());
            eventDTO.setPosterUrl(session.getEvent().getPosterUrl());
            // Event doesn't have location field - will come from venue or session

            dto.setEvent(eventDTO);
        }
        
        return dto;
    }
    
    /**
     * Convert Ticket entity to TicketDTO
     */
    private TicketDTO convertToTicketDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setTicketId(ticket.getTicketId());
        dto.setQrCodeUrl(ticket.getQrCodeUrl());
        dto.setUsedFlag(ticket.isUsedFlag()); // Use isUsedFlag() for primitive boolean
        dto.setOrderId(ticket.getOrder() != null ? ticket.getOrder().getOrderId() : null);
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());

        // Convert ticket category using builder
        TicketCategory category = ticket.getCategory();
        TicketCategoryDTO categoryDTO = TicketCategoryDTO.builder()
            .ticketCategoryId(category.getCategoryId())
            .sessionId(category.getSession().getSessionId())
            .name(category.getCategoryName()) // Backend field: categoryName -> DTO field: name
            .price(category.getPrice())
            .quantity(category.getMaximumSlot())
            .soldQuantity(0) // can be calculated if needed
            .build();
        
        dto.setTicketCategory(categoryDTO);
        
        return dto;
    }
}
