package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "email_address", unique = true, nullable = false)
    private String emailAddress;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.AUTHENTICATED;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    // Login attempt tracking
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    // Roles - automatically managed based on profiles
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "user_role",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    // Optional one-to-one with participant profile
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private ParticipantProfile participantProfile;

    // Optional one-to-one with organizer profile
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrganizerProfile organizerProfile;

    // Helper methods
    public boolean hasParticipantProfile() {
        return participantProfile != null;
    }

    public boolean hasOrganizerProfile() {
        return organizerProfile != null;
    }

    public void addRole(Role role) {
        roles.add(role);
    }

    public void removeRole(Role role) {
        roles.remove(role);
    }

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }

    public boolean isParticipant() {
        return roles.contains(Role.ROLE_PARTICIPANT);
    }

    public boolean isOrganizer() {
        return roles.contains(Role.ROLE_ORGANIZER);
    }
}