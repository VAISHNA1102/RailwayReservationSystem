package com.railway.reservation_service.controller;

import com.railway.reservation_service.dto.CancellationRequestDTO;
import com.railway.reservation_service.dto.CancellationResponseDTO;
import com.railway.reservation_service.dto.ReservationRequestDTO;
import com.railway.reservation_service.dto.ReservationResponseDTO;
import com.railway.reservation_service.entity.TrainTrip;
import com.railway.reservation_service.entity.TripSeatInventory;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.service.ReservationService;
import com.railway.reservation_service.service.TripGenerationService;
import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reservations")
@Slf4j
public class ReservationController {
    private final ReservationService reservationService;
    private final TrainTripRepository tripRepository;
    private final TripSeatInventoryRepository inventoryRepository;
    private final TripGenerationService tripGenerationService;
    private final com.railway.reservation_service.feign.ITrainClient ITrainClient;

    public ReservationController(ReservationService reservationService,
                               TrainTripRepository tripRepository,
                               TripSeatInventoryRepository inventoryRepository,
                               TripGenerationService tripGenerationService,
                               com.railway.reservation_service.feign.ITrainClient ITrainClient) {
        this.reservationService = reservationService;
        this.tripRepository = tripRepository;
        this.inventoryRepository = inventoryRepository;
        this.tripGenerationService = tripGenerationService;
        this.ITrainClient = ITrainClient;
    }

    /**
     * Creates a new reservation.
     */
    @PostMapping("/addReservation")
    public ResponseEntity<ReservationResponseDTO> makeReservation(@Valid @RequestBody ReservationRequestDTO reservationRequestDTO) {
        ReservationResponseDTO responseDTO = reservationService.makeReservation(reservationRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }


    /**
     * Retrieves reservation details using the PNR.
     */
    @GetMapping("/getReservationByPNR/{pnr}")
    public ResponseEntity<ReservationResponseDTO> getReservationByPNR(@PathVariable String pnr) {
        ReservationResponseDTO response = reservationService.getReservationByPNR(pnr);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Updates the reservation status to CONFIRMED using the PNR.
     */
    @PutMapping("/updateStatus/{pnr}")
    public ResponseEntity<String> updateReservationStatus(@PathVariable String pnr) {
        reservationService.updateStatusByPNR(pnr);
        return ResponseEntity.ok("Reservation status updated to: CONFIRMED");
    }



    /**
     * Retrieves all reservations.
     */
    @GetMapping("/allReservations")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        List<ReservationResponseDTO> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }


    /**
     * Returns the total number of reservations.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAllReservations() {
        long count = reservationService.countAllReservations();
        return ResponseEntity.ok(count);
    }
    
    /**
     * Returns the count of confirmed reservations.
     */
    @GetMapping("/count/confirmed")
    public ResponseEntity<Long> countConfirmedReservations() {
        long count = reservationService.countConfirmedReservations();
        return ResponseEntity.ok(count);
    }
    
    /**
     * Returns the count of cancelled reservations.
     */
    @GetMapping("/count/cancelled")
    public ResponseEntity<Long> countCancelledReservations() {
        long count = reservationService.countCancelledReservations();
        return ResponseEntity.ok(count);
    }

    /**
     * Retrieves all reservations for a specific user.
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByUser(@PathVariable String username) {
        List<ReservationResponseDTO> reservations = reservationService.getReservationsByUser(username);
        return ResponseEntity.ok(reservations);
    }
    
    @PutMapping("/cancel/{pnr}")
    public ResponseEntity<CancellationResponseDTO> cancelReservation(
            @PathVariable String pnr, 
            @RequestBody(required = false) CancellationRequestDTO request) {
        if (request == null) request = new CancellationRequestDTO();
        CancellationResponseDTO response = reservationService.cancelReservation(pnr, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/cancellable/{pnr}")
    public ResponseEntity<Boolean> isCancellable(@PathVariable String pnr) {
        boolean cancellable = reservationService.isCancellable(pnr);
        return ResponseEntity.ok(cancellable);
    }
    
    @GetMapping("/availability/{trainId}/{journeyDate}")
    public ResponseEntity<Map<String, Integer>> getDateSpecificAvailability(
            @PathVariable Integer trainId, 
            @PathVariable String journeyDate) {
        
        Map<String, Integer> availability = new HashMap<>();
        
        try {
            LocalDate date = LocalDate.parse(journeyDate);
            
            // Get train details
            TrainDTO trainDTO = ITrainClient.getTrainById(trainId).getBody();
            if (trainDTO == null) {
                return ResponseEntity.ok(availability);
            }
            
            // Find or create trip
            TrainTrip trip = tripRepository.findByTrainIdAndJourneyDate(trainId, date)
                    .orElseGet(() -> {
                        tripGenerationService.createTripIfNotExists(trainDTO, date);
                        return tripRepository.findByTrainIdAndJourneyDate(trainId, date)
                                .orElse(null);
                    });
            
            if (trip != null && trainDTO.getTrainClasses() != null) {
                for (TrainClassDTO trainClass : trainDTO.getTrainClasses()) {
                    TripSeatInventory inventory = inventoryRepository
                            .findByTripIdAndClassId(trip.getTripId(), trainClass.getClassId())
                            .orElse(null);
                    
                    if (inventory != null) {
                        availability.put(trainClass.getClassType(), inventory.getAvailableSeats());
                    } else {
                        int totalSeats = trainClass.getTotalSeats() != null ? trainClass.getTotalSeats() : trainClass.getCapacity();
                        availability.put(trainClass.getClassType(), totalSeats);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Error getting availability: {}", e.getMessage());
        }
        
        return ResponseEntity.ok(availability);
    }
}
