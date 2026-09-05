package com.railway.reservation_service.repository;

import com.railway.reservation_service.entity.TrainTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TrainTripRepository extends JpaRepository<TrainTrip, Long> {
    
    Optional<TrainTrip> findByTrainIdAndJourneyDate(Integer trainId, LocalDate journeyDate);
    
    boolean existsByTrainIdAndJourneyDate(Integer trainId, LocalDate journeyDate);
    
    @Query("SELECT t FROM TrainTrip t WHERE t.trainId = :trainId AND t.journeyDate = :journeyDate")
    Optional<TrainTrip> findTripByTrainAndDate(@Param("trainId") Integer trainId, @Param("journeyDate") LocalDate journeyDate);
}