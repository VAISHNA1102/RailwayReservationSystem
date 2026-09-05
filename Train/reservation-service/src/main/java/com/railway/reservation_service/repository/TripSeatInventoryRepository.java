package com.railway.reservation_service.repository;

import com.railway.reservation_service.entity.TripSeatInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TripSeatInventoryRepository extends JpaRepository<TripSeatInventory, Long> {
    
    Optional<TripSeatInventory> findByTripIdAndClassId(Long tripId, Integer classId);
    
    @Query("SELECT i FROM TripSeatInventory i WHERE i.tripId = :tripId AND i.classId = :classId")
    Optional<TripSeatInventory> findInventoryByTripAndClass(@Param("tripId") Long tripId, @Param("classId") Integer classId);
}