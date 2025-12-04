package org.minhtrinh.eventease251.entity;

/**
 * Enum for fee payer in payment methods
 * MERCHANT and CUSTOMER are used in the database (V6 migration)
 * ORGANIZER and PARTICIPANT can be used interchangeably in code
 */
public enum FeePayer {
    ORGANIZER,   // Alias for MERCHANT
    PARTICIPANT  // Alias for CUSTOMER
}

