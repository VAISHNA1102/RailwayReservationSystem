package com.railway.reservation_service.controller;

import com.railway.reservation_service.service.TripGenerationService;
import com.railway.reservation_service.service.TripAvailabilityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips")
@Slf4j
public class TripController {
    
    private final TripGenerationService tripGenerationService;
    private final TripAvailabilityService availabilityService;
    
    public TripController(TripGenerationService tripGenerationService, TripAvailabilityService availabilityService) {
        this.tripGenerationService = tripGenerationService;
        this.availabilityService = availabilityService;
    }
    
    @PostMapping("/generate")
    public ResponseEntity<String> generateTrips() {
        tripGenerationService.generateTripsForNext90Days();
        return ResponseEntity.ok("Trip generation initiated successfully");
    }
    
    @GetMapping("/availability/{trainId}/{journeyDate}")
    public ResponseEntity<Map<String, Integer>> getDateSpecificAvailability(
            @PathVariable Integer trainId, 
            @PathVariable String journeyDate) {
        
        log.info("Received availability request for train {} on date {}", trainId, journeyDate);
        
        try {
            LocalDate date = LocalDate.parse(journeyDate);
            Map<String, Integer> availability = availabilityService.getAvailabilityForDate(trainId, date);
            log.info("Returning availability: {}", availability);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            log.error("Error processing availability request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}