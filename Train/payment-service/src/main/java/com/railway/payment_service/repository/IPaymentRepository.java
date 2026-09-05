package com.railway.payment_service.repository;

import com.railway.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface IPaymentRepository extends JpaRepository<Payment, Integer> {

    /**
     * Counts the total number of payments in the database.
     */
    @Query("SELECT COUNT(p) FROM Payment p")
    long countAllPayments();
    
    boolean existsByReservationId(Integer reservationId);
    
    Optional<Payment> findByReservationId(Integer reservationId);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    long countByPaymentStatusSuccess();
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = 'REFUNDED'")
    long countByPaymentStatusRefunded();
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    double sumAmountByPaymentStatusSuccess();
}
