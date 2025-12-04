package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private Long ticketId;
    private String qrCodeUrl;
    private Boolean usedFlag;
    private Long orderId;
    private TicketCategoryDTO ticketCategory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
