package com.railway.train_service.service;

import com.railway.train_service.dto.*;
import java.util.List;

public interface TrainService {

    TrainDTO addTrain(TrainRequestDTO trainRequestDTO);

    UpdatedTrainDTO updateTrain(String trainNumber, UpdatedTrainRequestDTO updatedTrainRequestDTO);

    TrainDTO getTrainById(Integer trainId);

    TrainDTO getTrainByNumber(String trainNumber);

    List<TrainDTO> getAllTrains();

    List<TrainDTO> getAllTrainsByName(String trainName);

    List<TrainDTO> searchBySourceAndDestination(String source, String destination);

    String deleteTrainByNumber(String trainNumber);

    void reduceSeats(String trainNumber, String classType, int seatsToReduce);

    void increaseSeats(String trainNumber, String classType, int seatsToIncrease);

    TrainClassDTO getTrainClassByTrainIdAndClassType(Integer trainId, String classType);

    TrainClassDTO getClassById(Integer classId);

    long countAllTrains();
}
