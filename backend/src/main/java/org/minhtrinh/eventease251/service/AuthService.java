package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.AuthResponse;
import org.minhtrinh.eventease251.dto.LoginRequest;
import org.minhtrinh.eventease251.dto.RegisterRequest;
import org.minhtrinh.eventease251.entity.ParticipantProfile;
import org.minhtrinh.eventease251.entity.Role;
import org.minhtrinh.eventease251.entity.User;
import org.minhtrinh.eventease251.entity.UserStatus;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RecaptchaService recaptchaService;

    /**
     * Validates password strength
     * Requirements: 8-16 characters, 1 uppercase, 1 number, 1 special character
     */
    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 16) {
            throw new RuntimeException("Password must be between 8 and 16 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Password must contain at least 1 uppercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must contain at least 1 number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new RuntimeException("Password must contain at least 1 special character");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Step 1: Verify reCAPTCHA first
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new RuntimeException("reCAPTCHA verification failed. Please try again.");
        }

        // Step 2: Validate password strength
        validatePassword(request.getPassword());

        // Step 3: Check if user already exists
        if (userRepository.findByEmailAddress(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Step 4: Create user with email and password
        User user = new User();
        user.setEmailAddress(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTimestamp(LocalDateTime.now());
        user.setStatus(UserStatus.AUTHENTICATED);
        user.setFailedLoginAttempts(0); // Initialize counter

        // Step 5: By default, create empty participant profile
        ParticipantProfile participantProfile = new ParticipantProfile();
        participantProfile.setUser(user);
        user.setParticipantProfile(participantProfile);

        // Save user first to get the userId generated
        User savedUser = userRepository.saveAndFlush(user);

        // Step 6: Now add ROLE_PARTICIPANT (userId is now available)
        savedUser.addRole(Role.ROLE_PARTICIPANT);
        savedUser = userRepository.save(savedUser);

        // Step 7: Generate JWT token
        String token = jwtTokenProvider.generateToken(savedUser);

        // Step 8: Return AuthResponse
        return new AuthResponse(
            token,
            savedUser.getUserId(),
            savedUser.getEmailAddress(),
            savedUser.getRoles(),
            savedUser.hasParticipantProfile(),
            savedUser.hasOrganizerProfile()
        );
    }

    /**
     * Login user with email and password
     *
     * SECURITY FEATURES:
     * - Account lockout after 5 failed attempts
     * - 1 hour lockout duration
     * - Progressive warnings (4, 3, 2, 1 attempts remaining)
     * - Auto-unlock after lockout period
     * - Counter reset on successful login
     *
     * LOGIN FLOW:
     * 1. Find user by email (throws generic error if not found)
     * 2. Check if account is currently locked
     *    - If locked and time not expired → Show time remaining
     *    - If locked but time expired → Reset counters and continue
     * 3. Check if account is suspended by admin
     * 4. Verify password
     *    - If WRONG:
     *      a. Increment failed_login_attempts counter
     *      b. If counter reaches 5 → Lock account for 1 hour
     *      c. Otherwise → Show attempts remaining
     *    - If CORRECT:
     *      a. Reset failed_login_attempts to 0
     *      b. Clear account_locked_until
     *      c. Generate token and login
     *
     * @param request LoginRequest containing email and password
     * @return AuthResponse with JWT token and user details
     * @throws RuntimeException if credentials are invalid, account is locked, or suspended
     */
    @Transactional(noRollbackFor = RuntimeException.class)
    public AuthResponse login(LoginRequest request) {
        // STEP 1: Find user by email
        // Note: We throw a generic message to not reveal if email exists
        User user = userRepository.findByEmailAddress(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // STEP 2: Check if account is locked
        if (user.getAccountLockedUntil() != null) {
            LocalDateTime now = LocalDateTime.now();

            if (now.isBefore(user.getAccountLockedUntil())) {
                // Account is STILL locked - calculate time remaining
                long minutesRemaining = java.time.Duration.between(now, user.getAccountLockedUntil()).toMinutes();
                throw new RuntimeException(
                    String.format("Account is locked due to multiple failed login attempts. " +
                                "Please try again in %d minute(s).", minutesRemaining)
                );
            } else {
                // Lock period EXPIRED - reset counters and continue
                user.setFailedLoginAttempts(0);
                user.setAccountLockedUntil(null);
                userRepository.saveAndFlush(user);
            }
        }

        // STEP 3: Check if account is suspended by admin
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("Account has been suspended. Please contact support.");
        }

        // STEP 4: Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // PASSWORD IS WRONG - Increment failed attempts counter
            int currentFailedAttempts = (user.getFailedLoginAttempts() != null) ? user.getFailedLoginAttempts() : 0;
            int newFailedAttempts = currentFailedAttempts + 1;
            user.setFailedLoginAttempts(newFailedAttempts);

            // Check if this is the 5th failed attempt
            if (newFailedAttempts >= 5) {
                // LOCK THE ACCOUNT for 1 hour
                user.setAccountLockedUntil(LocalDateTime.now().plusHours(1));
                userRepository.saveAndFlush(user); // Use saveAndFlush to commit immediately

                throw new RuntimeException(
                    "Account locked due to multiple failed login attempts. " +
                    "Please try again in 1 hour."
                );
            }

            // Save the incremented counter and FLUSH to commit immediately
            userRepository.saveAndFlush(user);

            // Show how many attempts are remaining
            int attemptsRemaining = 5 - newFailedAttempts;
            throw new RuntimeException(
                String.format("Invalid email or password. %d attempt(s) remaining before account lock.",
                            attemptsRemaining)
            );
        }

        // STEP 5: PASSWORD IS CORRECT - Reset failed attempts counter
        if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            userRepository.save(user);
        }

        // STEP 6: Generate JWT token
        String token = jwtTokenProvider.generateToken(user);

        // STEP 7: Return successful login response
        return new AuthResponse(
            token,
            user.getUserId(),
            user.getEmailAddress(),
            user.getRoles(),
            user.hasParticipantProfile(),
            user.hasOrganizerProfile()
        );
    }
}

