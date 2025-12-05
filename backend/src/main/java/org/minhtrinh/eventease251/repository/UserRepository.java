package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository using JPA
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address
     * @param emailAddress The email address to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmailAddress(String emailAddress);
}