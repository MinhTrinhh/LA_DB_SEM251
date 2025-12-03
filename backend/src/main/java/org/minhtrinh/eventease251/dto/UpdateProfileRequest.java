package org.minhtrinh.eventease251.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
}
