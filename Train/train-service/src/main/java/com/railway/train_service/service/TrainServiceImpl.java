package com.railway.train_service.service;

import com.railway.train_service.dto.*;
import com.railway.train_service.entity.Train;
import com.railway.train_service.entity.TrainClass;
import com.railway.train_service.repository.TrainClassRepository;
import com.railway.train_service.repository.TrainRepository;
import com.railway.train_service.utility.TrainMapper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class TrainServiceImpl implements TrainService {
    private final TrainRepository trainRepository;
    private final TrainClassRepository trainClassRepository;

    public TrainServiceImpl(TrainRepository trainRepository, TrainClassRepository trainClassRepository) {
        this.trainRepository = trainRepository;
        this.trainClassRepository = trainClassRepository;
    }


    /**
     * Adds a new train to the system.
     */
    @Override
    public TrainDTO addTrain(TrainRequestDTO trainRequestDTO) {
        Optional<Train> existingTrain = trainRepository.findByTrainNumber(trainRequestDTO.getTrainNumber());

        if(existingTrain.isPresent()){
            throw new IllegalArgumentException("Train with number " + trainRequestDTO.getTrainNumber() + " already exists!");
        }

        Train train = TrainMapper.mapToEntity(trainRequestDTO);

        train.getTrainClasses().forEach(tc -> tc.setTrain(train));

        Train savedTrain = trainRepository.save(train);
        log.info("Train saved with ID: " + savedTrain.getTrainId());

        TrainDTO trainResponse = TrainMapper.mapToDTO(savedTrain);

        return trainResponse;
    }



    /**
     * Retrieves a train by its ID.
     */
    @Override
    public TrainDTO getTrainById(Integer trainId) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new IllegalArgumentException("Train with ID " + trainId + " not found"));
        log.info("Train found with ID: " + train.getTrainId());

        return TrainMapper.mapToDTO(train);
    }



    /**
     * Retrieves a train class by its class ID.
     */
    @Override
    public TrainClassDTO getClassById(Integer classId) {
        List<Train> allTrains = trainRepository.findAll();

        for (Train train : allTrains) {
            for (TrainClass trainClass : train.getTrainClasses()) {
                if (trainClass.getClassId().equals(classId)) {
                    log.info("TrainClass found with ID: " + trainClass.getClassId());

                    return TrainClassDTO.builder()
                            .classId(trainClass.getClassId())
                            .classType(trainClass.getClassType())
                            .capacity(trainClass.getCapacity())
                            .price(trainClass.getPrice())
                            .quota(trainClass.getQuota())
                            .availableSeats(trainClass.getAvailableSeats())
                            .totalSeats(trainClass.getCapacity())
                            .build();
                }
            }
        }

        throw new RuntimeException("TrainClass with id " + classId + " not found");
    }



    /**
     * Retrieves a train class by train ID and class type.
     */
    @Override
    public TrainClassDTO getTrainClassByTrainIdAndClassType(Integer trainId, String classType) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found"));

        TrainClass matchedClass = train.getTrainClasses().stream()
                .filter(tc -> tc.getClassType().equalsIgnoreCase(classType))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Class type not found for this train"));

        log.info("TrainClass found with ID: " + matchedClass.getClassId());

        return TrainClassDTO.builder()
                .classId(matchedClass.getClassId())
                .classType(matchedClass.getClassType())
                .capacity(matchedClass.getCapacity())
                .availableSeats(matchedClass.getAvailableSeats())
                .price(matchedClass.getPrice())
                .quota(matchedClass.getQuota())
                .totalSeats(matchedClass.getCapacity())
                .build();
    }



    /**
     * Retrieves all trains from the database.
     */
    @Override
    public List<TrainDTO> getAllTrains() {
        List<Train> allTrains = trainRepository.findAll();

        List<TrainDTO> trainDTO = allTrains.stream().map(TrainMapper::mapToDTO).toList();
        log.info("Trains fetched successfully!");

        return trainDTO;
    }



    /**
     * Retrieves a train by its number.
     */
    @Override
    public TrainDTO getTrainByNumber(String trainNumber) {
        Train train = trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new IllegalArgumentException("Train with number " + trainNumber + " not found"));

        TrainDTO trainResponse = TrainMapper.mapToDTO(train);
        log.info("Train with number " + trainNumber + " fetched successfully!");

        return trainResponse;
    }


    /**
     * Retrieves all trains by their name.
     */
    @Override
    public List<TrainDTO> getAllTrainsByName(String trainName) {
        List<Train> allTrains = trainRepository.findAllByTrainNameIgnoreCase(trainName);

        if(allTrains.isEmpty()){
            throw new IllegalArgumentException("Trains with name " + trainName + " does not exist!");
        }

        List<TrainDTO> trainResponse = allTrains.stream().map(TrainMapper::mapToDTO).toList();
        log.info("Trains with name " + trainName + " fetched successfully!");

        return trainResponse;
    }



    /**
     * Searches trains by source and destination.
     */
    @Override
    public List<TrainDTO> searchBySourceAndDestination(String source, String destination) {
        return trainRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source, destination).stream()
                .map(TrainMapper::mapToDTO)
                .toList();
    }



    /**
     * Reduces available seats in a specific train class.
     */
    @Override
    @Transactional
    public void reduceSeats(String trainNumber, String classType, int seatsToReduce) {
        Train train = trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new RuntimeException("Train not found: " + trainNumber));

        TrainClass trainClass = trainClassRepository.findByTrainAndClassType(train, classType)
                .orElseThrow(() -> new RuntimeException("Class type not found: " + classType));

        int currentSeats = trainClass.getAvailableSeats();
        if (currentSeats < seatsToReduce) {
            throw new IllegalArgumentException("Not enough seats available in " + classType);
        }

        trainClass.setAvailableSeats(currentSeats - seatsToReduce);
        trainClassRepository.save(trainClass);

        log.info("Seats reduced: Train={}, ClassType={}, SeatsBooked={}, RemainingSeats={}",
                trainNumber, classType, seatsToReduce, trainClass.getAvailableSeats());
    }


    /**
     * Restores available seats in a specific train class.
     */
    @Override
    @Transactional
    public void increaseSeats(String trainNumber, String classType, int seatsToIncrease) {
        Train train = trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new RuntimeException("Train not found: " + trainNumber));

        TrainClass trainClass = trainClassRepository.findByTrainAndClassType(train, classType)
                .orElseThrow(() -> new RuntimeException("Class type not found: " + classType));

        int restoredSeats = trainClass.getAvailableSeats() + seatsToIncrease;
        trainClass.setAvailableSeats(Math.min(restoredSeats, trainClass.getCapacity()));
        trainClassRepository.save(trainClass);

        log.info("Seats restored: Train={}, ClassType={}, SeatsRestored={}, AvailableSeats={}",
                trainNumber, classType, seatsToIncrease, trainClass.getAvailableSeats());
    }



    /**
     * Updates an existing train's details including its classes.
     */
    @Override
    @Transactional
    public UpdatedTrainDTO updateTrain(String trainNumber, UpdatedTrainRequestDTO updatedTrainRequestDTO) {
        Train existingTrain = trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new IllegalArgumentException("Train with number " + trainNumber + " not found"));

        // Update train basic details
        existingTrain.setTrainName(updatedTrainRequestDTO.getTrainName());
        existingTrain.setTrainType(updatedTrainRequestDTO.getTrainType());
        existingTrain.setSource(updatedTrainRequestDTO.getSource());
        existingTrain.setDestination(updatedTrainRequestDTO.getDestination());
        existingTrain.setDepartureTime(updatedTrainRequestDTO.getDepartureTime());
        existingTrain.setArrivalTime(updatedTrainRequestDTO.getArrivalTime());
        existingTrain.setRunningDays(updatedTrainRequestDTO.getRunningDays());
        existingTrain.setAvailability(updatedTrainRequestDTO.isAvailability());

        // Update train classes safely
        for (TrainClassRequestDTO dto : updatedTrainRequestDTO.getTrainClasses()) {
            TrainClass existingClass = trainClassRepository
                    .findByTrainAndClassType(existingTrain, dto.getClassType())
                    .orElse(null);

            if (existingClass != null) {
                // Update existing class (don’t reset availableSeats)
                existingClass.setCapacity(dto.getCapacity());
                existingClass.setPrice(dto.getPrice());
                existingClass.setQuota(dto.getQuota());

                // Optional: adjust availableSeats only if capacity reduced
                if (dto.getCapacity() < existingClass.getAvailableSeats()) {
                    existingClass.setAvailableSeats(dto.getCapacity());
                }
            } else {
                // New class
                TrainClass newClass = TrainClass.builder()
                        .classType(dto.getClassType())
                        .capacity(dto.getCapacity())
                        .availableSeats(dto.getCapacity())
                        .price(dto.getPrice())
                        .quota(dto.getQuota())
                        .train(existingTrain)
                        .build();
                existingTrain.getTrainClasses().add(newClass);
            }
        }

        existingTrain.setUpdatedAt(LocalDateTime.now());

        Train savedTrain = trainRepository.save(existingTrain);
        log.info("Train with number {} updated successfully!", trainNumber);

        return TrainMapper.mapToUpdatedDTO(savedTrain);
    }




    /**
     * Deletes a train by its number.
     */
    @Transactional
    @Override
    public String deleteTrainByNumber(String trainNumber) {
        Optional<Train> train = trainRepository.findByTrainNumber(trainNumber);

        if(train.isEmpty()){
            throw new IllegalArgumentException("Train with number " + trainNumber + " does not exist!");
        }

        trainRepository.delete(train.get());
        log.info("Train with number " + trainNumber + " deleted successfully!");

        String response = "Train with number " + trainNumber + " deleted successfully!";

        return response;
    }



    /**
     * Returns the total number of trains in the system.
     */
    @Override
    public long countAllTrains() {
        return trainRepository.countAllTrains();
    }
}
