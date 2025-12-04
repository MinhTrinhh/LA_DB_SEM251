package org.minhtrinh.eventease251.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TicketCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String categoryName;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    // Optional agreement terms
    private List<String> agreementTerms;
}
