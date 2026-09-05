package com.railway.reservation_service.service;

import com.railway.reservation_service.entity.TrainTrip;
import com.railway.reservation_service.entity.TripSeatInventory;
import com.railway.reservation_service.entity.TripStatus;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class TripGenerationService {
    
    private final TrainTripRepository tripRepository;
    private final TripSeatInventoryRepository inventoryRepository;
    private final ITrainClient trainClient;
    
    public TripGenerationService(TrainTripRepository tripRepository, 
                               TripSeatInventoryRepository inventoryRepository,
                               ITrainClient trainClient) {
        this.tripRepository = tripRepository;
        this.inventoryRepository = inventoryRepository;
        this.trainClient = trainClient;
    }
    
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void generateTripsForNext90Days() {
        log.info("Starting trip generation for next 90 days");
        LocalDate startDate = LocalDate.now().plusDays(1);
        LocalDate endDate = startDate.plusDays(90);
        
        try {
            List<TrainDTO> trains = trainClient.getAllTrains().getBody();
            if (trains != null) {
                for (TrainDTO train : trains) {
                    if (train.isAvailability()) {
                        generateTripsForTrain(train, startDate, endDate);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate trips: {}", e.getMessage());
        }
    }
    
    private void generateTripsForTrain(TrainDTO train, LocalDate start, LocalDate end) {
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (isTrainRunningOnDay(train, date)) {
                createTripIfNotExists(train, date);
            }
        }
    }
    
    private boolean isTrainRunningOnDay(TrainDTO train, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        String dayName = dayOfWeek.toString().substring(0, 3); // MON, TUE, etc.
        return train.getRunningDays() != null && train.getRunningDays().contains(dayName);
    }
    
    @Transactional
    public void createTripIfNotExists(TrainDTO train, LocalDate journeyDate) {
        if (!tripRepository.existsByTrainIdAndJourneyDate(train.getTrainId(), journeyDate)) {
            // Create trip with proper date-time combination
            TrainTrip trip = TrainTrip.builder()
                .trainId(train.getTrainId())
                .journeyDate(journeyDate)
                .departureDateTime(journeyDate.atTime(train.getDepartureTime().toLocalTime()))
                .arrivalDateTime(journeyDate.atTime(train.getArrivalTime().toLocalTime()))
                .status(TripStatus.ACTIVE)
                .build();
            
            log.info("Creating trip for train {} on journey date {} with departure time {}", 
                    train.getTrainNumber(), journeyDate, journeyDate.atTime(train.getDepartureTime().toLocalTime()));
            
            TrainTrip savedTrip = tripRepository.save(trip);
            log.info("Created trip {} for train {} on {}", savedTrip.getTripId(), train.getTrainNumber(), journeyDate);
            
            // Create seat inventory for each class
            if (train.getTrainClasses() != null) {
                for (TrainClassDTO trainClass : train.getTrainClasses()) {
                    TripSeatInventory inventory = TripSeatInventory.builder()
                        .tripId(savedTrip.getTripId())
                        .classId(trainClass.getClassId())
                        .availableSeats(trainClass.getTotalSeats())
                        .bookedSeats(0)
                        .build();
                    
                    inventoryRepository.save(inventory);
                    log.info("Created inventory for trip {} class {} with {} seats", 
                            savedTrip.getTripId(), trainClass.getClassType(), trainClass.getTotalSeats());
                }
            }
        }
    }
}