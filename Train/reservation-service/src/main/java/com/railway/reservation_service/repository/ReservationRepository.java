package com.railway.reservation_service.repository;

import com.railway.reservation_service.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    Optional<Reservation> findByPNR(String pnr);
    
    List<Reservation> findByUserName(String userName);


    /**
     * Counts the total number of reservations in the database.
     */
    @Query("SELECT COUNT(r) FROM Reservation r")
    long countAllReservations();
    
    /**
     * Counts confirmed reservations.
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.bookingStatus = com.railway.reservation_service.entity.BookingStatus.CONFIRMED")
    long countByBookingStatusConfirmed();
    
    /**
     * Counts cancelled reservations.
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.bookingStatus = com.railway.reservation_service.entity.BookingStatus.CANCELLED")
    long countByBookingStatusCancelled();
}
