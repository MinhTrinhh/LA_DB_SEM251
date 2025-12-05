package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "[user]")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"userRoles", "participantProfile", "organizerProfile"})
@EqualsAndHashCode(exclude = {"userRoles", "participantProfile", "organizerProfile"})
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

    // Roles - managed through UserRole entity
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UserRole> userRoles = new HashSet<>();

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
        // Check if role already exists
        if (hasRole(role)) {
            return;
        }
        UserRole userRole = new UserRole();
        userRole.setUserId(this.userId);
        userRole.setRole(role);
        userRole.setUser(this);
        userRoles.add(userRole);
    }

    public void removeRole(Role role) {
        userRoles.removeIf(userRole -> userRole.getRole().equals(role));
    }

    public boolean hasRole(Role role) {
        return userRoles.stream().anyMatch(userRole -> userRole.getRole().equals(role));
    }

    public Set<Role> getRoles() {
        Set<Role> roles = new HashSet<>();
        for (UserRole userRole : userRoles) {
            roles.add(userRole.getRole());
        }
        return roles;
    }

    public boolean isParticipant() {
        return hasRole(Role.ROLE_PARTICIPANT);
    }

    public boolean isOrganizer() {
        return hasRole(Role.ROLE_ORGANIZER);
    }
}