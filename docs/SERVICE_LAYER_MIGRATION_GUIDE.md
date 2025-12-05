# 🔄 Service Layer Updates for Pure JDBC Repositories

**Task:** Update service classes to use new pure JDBC repository implementations  
**Date:** December 6, 2025  
**Status:** 📋 **GUIDE**

---

## Required Changes in Service Layer

Since we've replaced JPA repositories with pure JDBC implementations, the service layer needs minor updates to use the new repository classes.

---

## 1. Update Repository Injection

### Before (JPA)
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;  // JPA interface
    private final ParticipantProfileRepository participantProfileRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final UserRoleRepository userRoleRepository;
}
```

### After (Pure JDBC)
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepositoryImpl userRepository;  // Pure JDBC implementation
    private final ParticipantProfileRepositoryImpl participantProfileRepository;
    private final OrganizerProfileRepositoryImpl organizerProfileRepository;
    private final UserRoleRepositoryImpl userRoleRepository;
}
```

**OR** - Keep the same field names and just update the type:
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepositoryImpl userRepository;
    // ... rest stays the same
}
```

---

## 2. Method Calls Remain the Same ✅

The good news is that method signatures are **identical**, so your existing code continues to work:

```java
// ✅ Same as before - no changes needed
Optional<User> user = userRepository.findByEmailAddress(email);

// ✅ Same as before - no changes needed
Optional<ParticipantProfile> profile = participantProfileRepository.findByUserId(userId);

// ✅ Same as before - no changes needed  
Optional<OrganizerProfile> orgProfile = organizerProfileRepository.findByUserId(userId);

// ✅ Same as before - no changes needed
List<UserRole> roles = userRoleRepository.findByUserId(userId);

// ✅ Same as before - no changes needed
userRoleRepository.deleteByUserIdAndRole(userId, "ROLE_PARTICIPANT");
```

---

## 3. Remove JPA-Specific Methods

Some JPA methods are no longer available. Replace them with equivalent JDBC methods:

### Example 1: count()
```java
// ❌ Before (JPA)
long userCount = userRepository.count();

// ✅ After (Pure JDBC) - Add custom method
int userCount = userRepository.countAll();
```

### Example 2: findAll()
```java
// ❌ Before (JPA)
List<User> allUsers = userRepository.findAll();

// ✅ After (Pure JDBC) - Add custom method
List<User> allUsers = userRepository.findAll();
```

### Example 3: Pagination
```java
// ❌ Before (JPA)
Page<User> users = userRepository.findAll(PageRequest.of(0, 10));

// ✅ After (Pure JDBC) - Add custom method with OFFSET/FETCH
List<User> users = userRepository.findAll(0, 10);
```

---

## 4. Files That Need Updates

### AuthService.java
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    // Change from interfaces to implementations
    private final UserRepositoryImpl userRepository;
    private final ParticipantProfileRepositoryImpl participantProfileRepository;
    private final OrganizerProfileRepositoryImpl organizerProfileRepository;
    private final UserRoleRepositoryImpl userRoleRepository;
    
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    // ✅ All existing methods work as-is
    public AuthResponse register(RegisterRequest request) {
        // No changes needed - methods are the same
        Optional<User> existingUser = userRepository.findByEmailAddress(request.getEmail());
        // ...
    }
}
```

### ProfileService.java
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {
    // Change from interfaces to implementations
    private final ParticipantProfileRepositoryImpl participantProfileRepository;
    private final OrganizerProfileRepositoryImpl organizerProfileRepository;
    private final UserRepositoryImpl userRepository;
    
    // ✅ All existing methods work as-is
    public ParticipantProfileDTO getParticipantProfile(Long userId) {
        Optional<ParticipantProfile> profile = participantProfileRepository.findByUserId(userId);
        // ...
    }
}
```

---

## 5. Optional: Create Interfaces for Dependency Injection

To avoid tight coupling to implementation classes, you can create interfaces:

### UserRepository Interface (NEW)
```java
public interface UserRepository {
    Optional<User> findById(Long userId);
    Optional<User> findByEmailAddress(String emailAddress);
    User save(User user);
    void deleteById(Long userId);
    boolean existsById(Long userId);
    boolean existsByEmail(String emailAddress);
}
```

### UserRepositoryImpl implements UserRepository
```java
@Repository
@RequiredArgsConstructor
@Slf4j
public class UserRepositoryImpl implements UserRepository {
    private final JdbcTemplate jdbcTemplate;
    
    @Override
    public Optional<User> findById(Long userId) {
        // ... implementation
    }
    
    // ... other methods
}
```

### Service uses interface
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;  // Interface, not implementation
    
    // Spring will inject UserRepositoryImpl automatically
}
```

**Benefits:**
- ✅ Loose coupling
- ✅ Easier to test (can mock interface)
- ✅ Can swap implementations
- ✅ Better architecture

---

## 6. Quick Migration Checklist

For each service class that uses repositories:

- [ ] Replace `UserRepository` with `UserRepositoryImpl` (or create interface)
- [ ] Replace `ParticipantProfileRepository` with `ParticipantProfileRepositoryImpl`
- [ ] Replace `OrganizerProfileRepository` with `OrganizerProfileRepositoryImpl`
- [ ] Replace `UserRoleRepository` with `UserRoleRepositoryImpl`
- [ ] Remove any JPA-specific method calls (if any)
- [ ] Test all functionality
- [ ] Verify no compilation errors

---

## 7. Example: Complete AuthService Update

**Before:**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ParticipantProfileRepository participantProfileRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    // ... methods
}
```

**After:**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepositoryImpl userRepository;
    private final UserRoleRepositoryImpl userRoleRepository;
    private final ParticipantProfileRepositoryImpl participantProfileRepository;
    private final OrganizerProfileRepositoryImpl organizerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    // ✅ All existing methods work without changes
}
```

---

## 8. Testing

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepositoryImpl userRepository;
    
    @Mock
    private UserRoleRepositoryImpl userRoleRepository;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void testRegister() {
        // Same tests, just mock the implementation classes
        when(userRepository.findByEmailAddress(anyString()))
            .thenReturn(Optional.empty());
        
        // ... test logic
    }
}
```

### Integration Tests
```java
@SpringBootTest
@Transactional
class AuthServiceIntegrationTest {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepositoryImpl userRepository;
    
    @Test
    void testUserCreation() {
        // Test with real database
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        
        AuthResponse response = authService.register(request);
        
        assertNotNull(response.getToken());
    }
}
```

---

## Summary

✅ **Change repository injection** - Use `*RepositoryImpl` classes  
✅ **Method calls stay the same** - API is identical  
✅ **Remove JPA-specific calls** - Add custom methods if needed  
✅ **Consider interfaces** - For loose coupling (optional)  
✅ **Test thoroughly** - Ensure everything works  

**Estimated Time:** 10-15 minutes per service class  
**Risk Level:** Low (API is backward compatible)  
**Rollback:** Easy (revert to JPA repositories if needed)

---

**Last Updated:** December 6, 2025  
**Status:** 📋 **READY TO IMPLEMENT**

