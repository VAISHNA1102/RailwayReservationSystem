package com.railway.reservation_service.service;

import com.railway.reservation_service.entity.TrainTrip;
import com.railway.reservation_service.entity.TripSeatInventory;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class TripAvailabilityService {
    
    private final TrainTripRepository tripRepository;
    private final TripSeatInventoryRepository inventoryRepository;
    private final ITrainClient trainClient;
    private final TripGenerationService tripGenerationService;
    
    public TripAvailabilityService(TrainTripRepository tripRepository, 
                                 TripSeatInventoryRepository inventoryRepository,
                                 ITrainClient trainClient,
                                 TripGenerationService tripGenerationService) {
        this.tripRepository = tripRepository;
        this.inventoryRepository = inventoryRepository;
        this.trainClient = trainClient;
        this.tripGenerationService = tripGenerationService;
    }
    
    public Map<String, Integer> getAvailabilityForDate(Integer trainId, LocalDate journeyDate) {
        Map<String, Integer> availability = new HashMap<>();
        
        log.info("Getting availability for train {} on date {}", trainId, journeyDate);
        
        try {
            // Get train details first
            TrainDTO trainDTO = trainClient.getTrainById(trainId).getBody();
            if (trainDTO == null) {
                log.error("Train not found with ID: {}", trainId);
                return availability;
            }
            
            // Find or create trip for the date
            Optional<TrainTrip> tripOpt = tripRepository.findByTrainIdAndJourneyDate(trainId, journeyDate);
            
            if (tripOpt.isEmpty()) {
                log.info("Trip not found for train {} on {}, creating new trip", trainId, journeyDate);
                tripGenerationService.createTripIfNotExists(trainDTO, journeyDate);
                tripOpt = tripRepository.findByTrainIdAndJourneyDate(trainId, journeyDate);
            }
            
            if (tripOpt.isPresent()) {
                TrainTrip trip = tripOpt.get();
                log.info("Found trip {} for train {} on {}", trip.getTripId(), trainId, journeyDate);
                
                // Get availability for each class
                if (trainDTO.getTrainClasses() != null) {
                    for (TrainClassDTO trainClass : trainDTO.getTrainClasses()) {
                        Optional<TripSeatInventory> inventoryOpt = inventoryRepository
                                .findByTripIdAndClassId(trip.getTripId(), trainClass.getClassId());
                        
                        if (inventoryOpt.isPresent()) {
                            int availableSeats = inventoryOpt.get().getAvailableSeats();
                            availability.put(trainClass.getClassType(), availableSeats);
                            log.info("Class {} has {} available seats for trip {}", 
                                    trainClass.getClassType(), availableSeats, trip.getTripId());
                        } else {
                            // Use total seats from train class if inventory not found
                            int totalSeats = trainClass.getTotalSeats() != null ? trainClass.getTotalSeats() : trainClass.getCapacity();
                            availability.put(trainClass.getClassType(), totalSeats);
                            log.warn("No inventory found for class {}, using total seats: {}", 
                                    trainClass.getClassType(), totalSeats);
                        }
                    }
                }
            } else {
                log.error("Failed to create/find trip for train {} on {}", trainId, journeyDate);
            }
            
        } catch (Exception e) {
            log.error("Error getting availability for train {} on {}: {}", trainId, journeyDate, e.getMessage(), e);
        }
        
        log.info("Final availability for train {} on {}: {}", trainId, journeyDate, availability);
        return availability;
    }
}