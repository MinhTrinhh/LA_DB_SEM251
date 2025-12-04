package org.minhtrinh.eventease251.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    @NotNull(message = "Session ID is required")
    private Long sessionId;
    
    @NotEmpty(message = "At least one ticket must be selected")
    private Map<Long, Integer> ticketQuantities; // ticketCategoryId -> quantity
    
    @NotNull(message = "Currency is required")
    private String currency;
    
    private String paymentMethod; // For future payment integration
}
