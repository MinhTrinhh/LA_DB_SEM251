package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Order;
import org.minhtrinh.eventease251.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders for a specific user, ordered by creation date descending
    List<Order> findByParticipantProfile_User_UserIdOrderByCreatedAtDesc(Long userId);

    // Find orders by status for a user
    List<Order> findByParticipantProfile_User_UserIdAndOrderStatusOrderByCreatedAtDesc(Long userId, OrderStatus orderStatus);

    // Custom query to fetch orders with tickets and ticket categories for My Tickets page
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.tickets t " +
           "LEFT JOIN FETCH t.category tc " +
           "LEFT JOIN FETCH tc.session s " +
           "LEFT JOIN FETCH s.event e " +
           "WHERE o.participantProfile.user.userId = :userId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersWithTicketsAndEventByUserId(@Param("userId") Long userId);
}