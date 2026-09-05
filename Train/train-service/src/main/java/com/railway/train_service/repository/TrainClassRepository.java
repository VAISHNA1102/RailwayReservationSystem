package com.railway.train_service.repository;

import com.railway.train_service.entity.Train;
import com.railway.train_service.entity.TrainClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainClassRepository extends JpaRepository<TrainClass, Integer> {

    Optional<TrainClass> findByTrainAndClassType(Train train, String classType);
}
