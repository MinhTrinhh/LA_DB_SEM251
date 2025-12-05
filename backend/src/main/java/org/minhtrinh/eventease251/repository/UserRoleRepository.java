package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Role;
import org.minhtrinh.eventease251.entity.UserRole;
import org.minhtrinh.eventease251.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Long userId);
    void deleteByUserIdAndRole(Long userId, Role role);
}

