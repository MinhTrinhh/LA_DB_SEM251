package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.CreateOrderRequest;
import org.minhtrinh.eventease251.dto.OrderDTO;
import org.minhtrinh.eventease251.dto.TicketDTO;
import org.minhtrinh.eventease251.dto.TicketCategoryDTO;
import org.minhtrinh.eventease251.dto.EventDTO;
import org.minhtrinh.eventease251.dto.SessionDTO;
import org.minhtrinh.eventease251.entity.Order;
import org.minhtrinh.eventease251.entity.Ticket;
import org.minhtrinh.eventease251.entity.TicketCategory;
import org.minhtrinh.eventease251.entity.User;
import org.minhtrinh.eventease251.entity.Session;
import org.minhtrinh.eventease251.entity.SessionId;
import org.minhtrinh.eventease251.repository.OrderRepository;
import org.minhtrinh.eventease251.repository.TicketRepository;
import org.minhtrinh.eventease251.repository.TicketCategoryRepository;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.minhtrinh.eventease251.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
        Session session = sessionRepository.findById(sessionId)
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
            if (soldTickets + quantity > category.getMaximumSlot()) {
                throw new RuntimeException("Not enough tickets available for category: " + category.getCategoryName());
            }
            
            ticketCategories.add(category);
            BigDecimal categoryTotal = category.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(categoryTotal);
        }
        
        // Create order
        Order order = new Order();
        order.setOrderStatus("PENDING"); // Initial status
        order.setCurrency(request.getCurrency());
        order.setAmountOfMoney(totalAmount);
        order.setParticipant(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        Order savedOrder = orderRepository.save(order);
        log.info("OrderService: Created order with ID: {}", savedOrder.getOrderId());
        
        // Create tickets for the order
        List<Ticket> tickets = new ArrayList<>();
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
                
                // Generate unique QR code URL for each ticket
                String qrCodeUrl = generateQRCodeUrl(savedOrder.getOrderId(), categoryId, i);
                ticket.setQrCodeUrl(qrCodeUrl);
                ticket.setCreatedAt(LocalDateTime.now());
                ticket.setUpdatedAt(LocalDateTime.now());
                
                tickets.add(ticket);
            }
        }
        
        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        log.info("OrderService: Created {} tickets for order {}", savedTickets.size(), savedOrder.getOrderId());
        
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
     * Generate QR code URL for a ticket
     */
    private String generateQRCodeUrl(Long orderId, Long categoryId, int ticketIndex) {
        String uniqueId = UUID.randomUUID().toString();
        return String.format("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER:%d-CAT:%d-TICKET:%d-UUID:%s",
                orderId, categoryId, ticketIndex, uniqueId);
    }
    
    /**
     * Convert Order entity to OrderDTO (without event details)
     */
    private OrderDTO convertToOrderDTO(Order order, List<Ticket> tickets) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setCurrency(order.getCurrency());
        dto.setAmountOfMoney(order.getAmountOfMoney());
        dto.setUserId(order.getParticipant().getUserId());
        // User has participantProfile with fullName
        String userName = order.getParticipant().getParticipantProfile() != null 
            ? order.getParticipant().getParticipantProfile().getFullName() 
            : "User";
        dto.setUserName(userName);
        dto.setUserEmail(order.getParticipant().getEmailAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        
        // Convert tickets
        List<TicketDTO> ticketDTOs = tickets.stream()
                .map(this::convertToTicketDTO)
                .collect(Collectors.toList());
        dto.setTickets(ticketDTOs);
        
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
            eventDTO.setOrganizerId(session.getEvent().getOrganizer().getUserId());
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
        dto.setUsedFlag(ticket.getUsedFlag());
        dto.setOrderId(ticket.getOrder().getOrderId());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        
        // Convert ticket category using builder
        TicketCategory category = ticket.getCategory();
        TicketCategoryDTO categoryDTO = TicketCategoryDTO.builder()
            .ticketCategoryId(category.getCategoryId())
            .sessionId(category.getSession().getSessionId())
            .categoryName(category.getCategoryName())
            .price(category.getPrice())
            .quantity(category.getMaximumSlot())
            .soldQuantity(0) // can be calculated if needed
            .build();
        
        dto.setTicketCategory(categoryDTO);
        
        return dto;
    }
}
