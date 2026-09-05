package com.railway.train_service.repository;

import com.railway.train_service.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TrainRepository extends JpaRepository<Train, Integer> {

    Optional<Train> findByTrainNumber(String trainNumber);

    List<Train> findAllByTrainNameIgnoreCase(String trainName);

    List<Train> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    /**
     * Counts the total number of trains in the database.
     */
    @Query("SELECT COUNT(t) FROM Train t")
    long countAllTrains();
}
