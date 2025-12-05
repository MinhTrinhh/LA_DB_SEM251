package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Role;
import org.minhtrinh.eventease251.entity.UserRole;
import org.minhtrinh.eventease251.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UserRole Repository using JPA
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    /**
     * Find all user roles by user ID
     * @param userId The user ID to search for
     * @return List of user roles for the specified user
     */
    List<UserRole> findByUserId(Long userId);

    /**
     * Delete user role by user ID and role
     * @param userId The user ID
     * @param role The role to delete
     */
    void deleteByUserIdAndRole(Long userId, Role role);
}

