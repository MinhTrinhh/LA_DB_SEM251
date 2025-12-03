package org.minhtrinh.eventease251.ultility;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.minhtrinh.eventease251.entity.Role;
import org.minhtrinh.eventease251.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    /**
     * Generate token from User entity (new method with roles)
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        // Convert roles to string list
        List<String> roleStrings = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getEmailAddress())
                .claim("userId", user.getUserId())
                .claim("roles", roleStrings)
                .claim("hasParticipantProfile", user.hasParticipantProfile())
                .claim("hasOrganizerProfile", user.hasOrganizerProfile())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

//    /**
//     * OLD METHOD - kept for backward compatibility
//     * @deprecated Use generateToken(User user) instead
//     */
//    @Deprecated
//    public String generateToken(String email, String userType, Long userId) {
//        Date now = new Date();
//        Date expiryDate = new Date(now.getTime() + jwtExpiration);
//
//        return Jwts.builder()
//                .setSubject(email)
//                .claim("userId", userId)
//                .claim("userType", userType)
//                .setIssuedAt(now)
//                .setExpiration(expiryDate)
//                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
//                .compact();
//    }

    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    /**
     * Get roles from token (new method)
     */
    @SuppressWarnings("unchecked")
    public Set<Role> getRolesFromToken(String token) {
        Claims claims = getClaims(token);
        List<String> roleStrings = claims.get("roles", List.class);

        if (roleStrings == null || roleStrings.isEmpty()) {
            return Set.of();
        }

        return roleStrings.stream()
                .map(Role::valueOf)
                .collect(Collectors.toSet());
    }

    /**
     * Check if token has participant profile
     */
    public boolean hasParticipantProfile(String token) {
        Claims claims = getClaims(token);
        Boolean hasProfile = claims.get("hasParticipantProfile", Boolean.class);
        return hasProfile != null && hasProfile;
    }

    /**
     * Check if token has organizer profile
     */
    public boolean hasOrganizerProfile(String token) {
        Claims claims = getClaims(token);
        Boolean hasProfile = claims.get("hasOrganizerProfile", Boolean.class);
        return hasProfile != null && hasProfile;
    }

//    /**
//     * OLD METHOD - kept for backward compatibility
//     * @deprecated Use getRolesFromToken() instead
//     */
//    @Deprecated
//    public String getUserTypeFromToken(String token) {
//        Claims claims = getClaims(token);
//        return claims.get("userType", String.class);
//    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Helper method to extract authenticated user ID from SecurityContext
     * @return Authenticated user's ID
     * @throws RuntimeException if user is not authenticated
     */
    public static Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        return (Long) authentication.getPrincipal();
    }

}