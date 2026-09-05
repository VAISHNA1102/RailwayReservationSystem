package com.railway.reservation_service.service;

import com.railway.reservation_service.dto.CancellationRequestDTO;
import com.railway.reservation_service.dto.CancellationResponseDTO;
import com.railway.reservation_service.dto.PassengerDTO;
import com.railway.reservation_service.dto.ReservationRequestDTO;
import com.railway.reservation_service.dto.ReservationResponseDTO;
import com.railway.reservation_service.entity.Passenger;
import com.railway.reservation_service.entity.Reservation;
import com.railway.reservation_service.entity.BookingStatus;
import com.railway.reservation_service.exception.ResourceNotFoundException;
import com.railway.reservation_service.entity.TrainTrip;
import com.railway.reservation_service.entity.TripSeatInventory;
import com.railway.reservation_service.feign.IPaymentClient;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.feign.IUserClient;
import com.railway.reservation_service.repository.ReservationRepository;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import com.railway.reservation_service.dto.UserDTO;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository ReservationRepository;
    private final IUserClient IUserClient;
    private final ITrainClient ITrainClient;
    private final IPaymentClient IPaymentClient;
    private final TrainTripRepository tripRepository;
    private final TripSeatInventoryRepository inventoryRepository;
    private final TripGenerationService tripGenerationService;

    public ReservationServiceImpl(ReservationRepository ReservationRepository, IUserClient IUserClient, 
                                ITrainClient ITrainClient, IPaymentClient IPaymentClient,
                                TrainTripRepository tripRepository, TripSeatInventoryRepository inventoryRepository,
                                TripGenerationService tripGenerationService) {
        this.ReservationRepository = ReservationRepository;
        this.IUserClient = IUserClient;
        this.ITrainClient = ITrainClient;
        this.IPaymentClient = IPaymentClient;
        this.tripRepository = tripRepository;
        this.inventoryRepository = inventoryRepository;
        this.tripGenerationService = tripGenerationService;
    }



 /**
 * Creates a new reservation using trip-based seat inventory
 */
 @Override
 @Transactional
    public ReservationResponseDTO makeReservation(ReservationRequestDTO request) {

        // Get user by userName
        UserDTO userDTO = IUserClient.getUserByUserName(request.getUserName()).getBody();
        if (userDTO == null || !userDTO.getUserName().equals(request.getUserName())) {
            throw new ResourceNotFoundException("User not found with username: " + request.getUserName());
        }

        // Get train by number
        TrainDTO trainDTO = ITrainClient.getTrainByNumber(request.getTrainNumber()).getBody();
        if (trainDTO == null || !trainDTO.getTrainNumber().equals(request.getTrainNumber())) {
            throw new ResourceNotFoundException("Train not found with number: " + request.getTrainNumber());
        }

        // Find or create trip for the specific date
        log.info("Looking for trip: trainId={}, journeyDate={}", trainDTO.getTrainId(), request.getJourneyDate());
        
        TrainTrip trip = tripRepository.findByTrainIdAndJourneyDate(trainDTO.getTrainId(), request.getJourneyDate())
                .orElseGet(() -> {
                    log.info("Trip not found, creating new trip for trainId={}, journeyDate={}", trainDTO.getTrainId(), request.getJourneyDate());
                    tripGenerationService.createTripIfNotExists(trainDTO, request.getJourneyDate());
                    return tripRepository.findByTrainIdAndJourneyDate(trainDTO.getTrainId(), request.getJourneyDate())
                            .orElseThrow(() -> new RuntimeException("Failed to create trip"));
                });
        
        log.info("Found/Created trip: tripId={}, journeyDate={}, departureDateTime={}", 
                trip.getTripId(), trip.getJourneyDate(), trip.getDepartureDateTime());

        // Get class information
        TrainClassDTO classDTO = ITrainClient
                .getTrainClassByTrainIdAndClassType(trainDTO.getTrainId(), request.getClassType())
                .getBody();

        if (classDTO == null || !classDTO.getClassType().equalsIgnoreCase(request.getClassType())) {
            throw new ResourceNotFoundException("Class type " + request.getClassType() +
                    " not available for train " + request.getTrainNumber());
        }

        // Find trip-specific seat inventory
        TripSeatInventory inventory = inventoryRepository.findByTripIdAndClassId(trip.getTripId(), classDTO.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Seat inventory not found for this trip and class"));

        // Validate booking time - prevent booking for trains that have already departed
        validateBookingTime(trip, trainDTO);
        
        // Check seat availability for this specific trip
        int requestedSeats = request.getPassengers().size();
        if (inventory.getAvailableSeats() < requestedSeats) {
            throw new IllegalStateException("Only " + inventory.getAvailableSeats() + " seats available for this journey.");
        }

        // Reserve seats atomically (optimistic locking prevents race conditions)
        inventory.setAvailableSeats(inventory.getAvailableSeats() - requestedSeats);
        inventory.setBookedSeats(inventory.getBookedSeats() + requestedSeats);
        inventoryRepository.save(inventory);

        ITrainClient.reduceSeats(trainDTO.getTrainNumber(), classDTO.getClassType(), requestedSeats);
        log.info("Reduced {} global seats for train {}, class {}", requestedSeats, trainDTO.getTrainNumber(), classDTO.getClassType());

        // Generate PNR
        String pnr = generatePNR();

        // Create reservation linked to specific trip
        Reservation reservation = Reservation.builder()
                .userName(userDTO.getUserName())
                .trainId(trainDTO.getTrainId())
                .tripId(trip.getTripId()) // Link to specific trip
                .classId(classDTO.getClassId())
                .journeyDate(request.getJourneyDate())
                .seatCount(requestedSeats)
                .bookingStatus(BookingStatus.PENDING)
                .PNR(pnr)
                .passengers(
                        request.getPassengers().stream()
                                .map(p -> Passenger.builder()
                                        .name(p.getName())
                                        .age(p.getAge())
                                        .gender(p.getGender())
                                        .address(p.getAddress())
                                        .windowSeatPreferred(p.getWindowSeatPreferred())
                                        .quota(p.getQuota())
                                        .reservation(null)
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();

        // Set reverse link
        reservation.getPassengers().forEach(p -> p.setReservation(reservation));

        // Save to DB
        Reservation saved = ReservationRepository.save(reservation);

        log.info("Reservation made successfully for trip {} with {} seats reserved", trip.getTripId(), requestedSeats);

        // Return response
        return ReservationResponseDTO.builder()
                .reservationId(saved.getReservationId())
                .pnrNumber(saved.getPNR())
                .trainNumber(trainDTO.getTrainNumber())
                .trainName(trainDTO.getTrainName())
                .classType(classDTO.getClassType())
                .username(userDTO.getUserName())
                .journeyDate(saved.getJourneyDate())
                .numberOfSeats(saved.getSeatCount())
                .totalFare(classDTO.getPrice() * saved.getSeatCount())
                .reservationStatus(saved.getBookingStatus().toString())
                .reservationTime(saved.getCreatedAt())
                .passengers(
                        saved.getPassengers().stream()
                                .map(p -> PassengerDTO.builder()
                                        .name(p.getName())
                                        .age(p.getAge())
                                        .gender(p.getGender())
                                        .address(p.getAddress())
                                        .windowSeatPreferred(p.getWindowSeatPreferred())
                                        .quota(p.getQuota())
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();
    }



    /**
     * Retrieves reservation details using the provided PNR.
     */
    @Override
    public ReservationResponseDTO getReservationByPNR(String pnr) {
        Reservation reservation = ReservationRepository.findByPNR(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with PNR: " + pnr));

        TrainDTO trainDTO = ITrainClient.getTrainById(reservation.getTrainId()).getBody();
        TrainClassDTO classDTO = ITrainClient.getClassById(reservation.getClassId()).getBody();

        log.info("Reservation found with PNR: " + pnr);

        return ReservationResponseDTO.builder()
                .reservationId(reservation.getReservationId())
                .pnrNumber(reservation.getPNR())
                .trainNumber(trainDTO.getTrainNumber())
                .trainName(trainDTO.getTrainName())
                .classType(classDTO.getClassType())
                .username(reservation.getUserName())
                .journeyDate(reservation.getJourneyDate())
                .numberOfSeats(reservation.getSeatCount())
                .totalFare(classDTO.getPrice() * reservation.getSeatCount())
                .reservationStatus(reservation.getBookingStatus().toString())
                .reservationTime(reservation.getCreatedAt())
                .passengers(
                        reservation.getPassengers().stream()
                                .map(p -> PassengerDTO.builder()
                                        .name(p.getName())
                                        .age(p.getAge())
                                        .gender(p.getGender())
                                        .address(p.getAddress())
                                        .windowSeatPreferred(p.getWindowSeatPreferred())
                                        .quota(p.getQuota())
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();
    }


    /**
     * Updates the booking status of a reservation to CONFIRMED using its PNR.
     */
    @Override
    public void updateStatusByPNR(String pnr) {
        Reservation reservation = ReservationRepository.findByPNR(pnr)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setBookingStatus(BookingStatus.CONFIRMED);

        ReservationRepository.save(reservation);
        log.info("Reservation status updated to CONFIRMED for PNR: " + pnr);
    }


    /**
     * Generates a random 6-character alphanumeric PNR.
     */
    private String generatePNR() {
        String alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int index = (int) (Math.random() * alphanumeric.length());
            sb.append(alphanumeric.charAt(index));
        }
        return sb.toString();
    }



    /**
     * Returns the total number of reservations in the system.
     */
    @Override
    public long countAllReservations() {
        return ReservationRepository.count();
    }
    
    /**
     * Returns the count of confirmed reservations.
     */
    @Override
    public long countConfirmedReservations() {
        return ReservationRepository.countByBookingStatusConfirmed();
    }
    
    /**
     * Returns the count of cancelled reservations.
     */
    @Override
    public long countCancelledReservations() {
        return ReservationRepository.countByBookingStatusCancelled();
    }


    /**
     * Retrieves all reservations from the database.
     */
    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        List<Reservation> reservations = ReservationRepository.findAll();

        return reservations.stream().map(reservation -> {
            var trainDTO = ITrainClient.getTrainById(reservation.getTrainId()).getBody();
            var classDTO = ITrainClient.getClassById(reservation.getClassId()).getBody();

            return ReservationResponseDTO.builder()
                    .reservationId(reservation.getReservationId())
                    .pnrNumber(reservation.getPNR())
                    .trainNumber(trainDTO != null ? trainDTO.getTrainNumber() : null)
                    .trainName(trainDTO != null ? trainDTO.getTrainName() : null)
                    .classType(classDTO != null ? classDTO.getClassType() : null)
                    .username(reservation.getUserName())
                    .journeyDate(reservation.getJourneyDate())
                    .numberOfSeats(reservation.getSeatCount())
                    .totalFare((classDTO != null ? classDTO.getPrice() : 0) * reservation.getSeatCount())
                    .reservationStatus(reservation.getBookingStatus().toString())
                    .reservationTime(reservation.getCreatedAt())
                    .passengers(
                            reservation.getPassengers().stream()
                                    .map(p -> PassengerDTO.builder()
                                            .name(p.getName())
                                            .age(p.getAge())
                                            .gender(p.getGender())
                                            .address(p.getAddress())
                                            .windowSeatPreferred(p.getWindowSeatPreferred())
                                            .quota(p.getQuota())
                                            .build())
                                    .collect(Collectors.toList())
                    )
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves all reservations for a specific user.
     */
    @Override
    public List<ReservationResponseDTO> getReservationsByUser(String username) {
        List<Reservation> reservations = ReservationRepository.findByUserName(username);

        return reservations.stream().map(reservation -> {
            var trainDTO = ITrainClient.getTrainById(reservation.getTrainId()).getBody();
            var classDTO = ITrainClient.getClassById(reservation.getClassId()).getBody();

            return ReservationResponseDTO.builder()
                    .reservationId(reservation.getReservationId())
                    .pnrNumber(reservation.getPNR())
                    .trainNumber(trainDTO != null ? trainDTO.getTrainNumber() : null)
                    .trainName(trainDTO != null ? trainDTO.getTrainName() : null)
                    .classType(classDTO != null ? classDTO.getClassType() : null)
                    .username(reservation.getUserName())
                    .journeyDate(reservation.getJourneyDate())
                    .numberOfSeats(reservation.getSeatCount())
                    .totalFare((classDTO != null ? classDTO.getPrice() : 0) * reservation.getSeatCount())
                    .reservationStatus(reservation.getBookingStatus().toString())
                    .reservationTime(reservation.getCreatedAt())
                    .passengers(
                            reservation.getPassengers().stream()
                                    .map(p -> PassengerDTO.builder()
                                            .name(p.getName())
                                            .age(p.getAge())
                                            .gender(p.getGender())
                                            .address(p.getAddress())
                                            .windowSeatPreferred(p.getWindowSeatPreferred())
                                            .quota(p.getQuota())
                                            .build())
                                    .collect(Collectors.toList())
                    )
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CancellationResponseDTO cancelReservation(String pnr, CancellationRequestDTO request) {
        Reservation reservation = ReservationRepository.findByPNR(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with PNR: " + pnr));
        
        validateCancellation(reservation);
        
        BigDecimal refundAmount = calculateRefund(reservation);
        
        reservation.setBookingStatus(BookingStatus.CANCELLED);
        reservation.setCancellationTime(LocalDateTime.now());
        reservation.setCancellationReason(request.getReason());
        reservation.setRefundAmount(refundAmount);
        
        // Restore seats to specific trip inventory
        if (reservation.getTripId() != null) {
            TripSeatInventory inventory = inventoryRepository.findByTripIdAndClassId(reservation.getTripId(), reservation.getClassId())
                    .orElse(null);
            if (inventory != null) {
                inventory.setAvailableSeats(inventory.getAvailableSeats() + reservation.getSeatCount());
                inventory.setBookedSeats(inventory.getBookedSeats() - reservation.getSeatCount());
                inventoryRepository.save(inventory);
                log.info("Restored {} seats to trip {} inventory", reservation.getSeatCount(), reservation.getTripId());
            }
        }

        TrainDTO trainDTO = ITrainClient.getTrainById(reservation.getTrainId()).getBody();
        TrainClassDTO classDTO = ITrainClient.getClassById(reservation.getClassId()).getBody();
        if (trainDTO != null && classDTO != null) {
            ITrainClient.increaseSeats(trainDTO.getTrainNumber(), classDTO.getClassType(), reservation.getSeatCount());
            log.info("Restored {} global seats for train {}, class {}",
                    reservation.getSeatCount(), trainDTO.getTrainNumber(), classDTO.getClassType());
        }
        
        ReservationRepository.save(reservation);
        
        // Process refund in payment service - CRITICAL: This must succeed
        try {
            log.info("Attempting to process refund for reservation ID: {} with amount: {}", reservation.getReservationId(), refundAmount.doubleValue());
            ResponseEntity<String> refundResponse = IPaymentClient.processRefund(reservation.getReservationId(), refundAmount.doubleValue());
            log.info("Refund processed successfully for PNR: {} - Response: {}", pnr, refundResponse.getBody());
        } catch (Exception e) {
            log.error("CRITICAL: Failed to process refund for PNR: {} - Error: {}", pnr, e.getMessage(), e);
            // If payment refund fails, we need to rollback the reservation cancellation
            reservation.setBookingStatus(BookingStatus.CONFIRMED);
            reservation.setCancellationTime(null);
            reservation.setCancellationReason(null);
            reservation.setRefundAmount(null);
            
            // Restore seats back to booked state
            if (reservation.getTripId() != null) {
                TripSeatInventory inventory = inventoryRepository.findByTripIdAndClassId(reservation.getTripId(), reservation.getClassId())
                        .orElse(null);
                if (inventory != null) {
                    inventory.setAvailableSeats(inventory.getAvailableSeats() - reservation.getSeatCount());
                    inventory.setBookedSeats(inventory.getBookedSeats() + reservation.getSeatCount());
                    inventoryRepository.save(inventory);
                }
            }
            
            ReservationRepository.save(reservation);
            throw new RuntimeException("Cancellation failed: Unable to process refund - " + e.getMessage());
        }
        
        log.info("Reservation cancelled successfully for PNR: " + pnr);
        
        return CancellationResponseDTO.builder()
                .pnr(pnr)
                .status("CANCELLED")
                .refundAmount(refundAmount)
                .cancellationTime(LocalDateTime.now())
                .message("Ticket cancelled successfully. 100% refund will be processed.")
                .build();
    }
    
    @Override
    public boolean isCancellable(String pnr) {
        try {
            Reservation reservation = ReservationRepository.findByPNR(pnr)
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with PNR: " + pnr));
            
            if (!reservation.getBookingStatus().equals(BookingStatus.CONFIRMED)) {
                return false;
            }
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime actualDepartureTime = getActualDepartureTime(reservation);
            long hoursUntilDeparture = ChronoUnit.HOURS.between(now, actualDepartureTime);
            
            log.info("Cancellability check for PNR {}: {} hours until departure, cancellable: {}", 
                    pnr, hoursUntilDeparture, hoursUntilDeparture >= 24);
            
            return hoursUntilDeparture >= 24;
        } catch (Exception e) {
            return false;
        }
    }
    
    private void validateCancellation(Reservation reservation) {
        if (!reservation.getBookingStatus().equals(BookingStatus.CONFIRMED)) {
            throw new IllegalStateException("Only confirmed tickets can be cancelled");
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime actualDepartureTime = getActualDepartureTime(reservation);
        long hoursUntilDeparture = ChronoUnit.HOURS.between(now, actualDepartureTime);
        
        log.info("Cancellation validation for PNR {}: Current time: {}, Departure time: {}, Hours until departure: {}", 
                reservation.getPNR(), now, actualDepartureTime, hoursUntilDeparture);
        
        if (hoursUntilDeparture < 24) {
            throw new IllegalStateException(String.format(
                "Cancellation not allowed. Only %d hours remaining until departure. Tickets can only be cancelled more than 24 hours before departure.", 
                hoursUntilDeparture));
        }
    }
    
    private LocalDateTime getActualDepartureTime(Reservation reservation) {
        TrainDTO trainDTO = ITrainClient.getTrainById(reservation.getTrainId()).getBody();
        if (trainDTO == null || trainDTO.getDepartureTime() == null) {
            log.warn("Train departure time not available for reservation {}, using fallback", reservation.getPNR());
            // Fallback to journey date at 23:59 if train departure time not available
            return reservation.getJourneyDate().atTime(23, 59);
        }
        
        // Combine journey date with train's departure time
        LocalDateTime actualDepartureTime = reservation.getJourneyDate().atTime(trainDTO.getDepartureTime().toLocalTime());
        log.info("Actual departure time for PNR {}: {}", reservation.getPNR(), actualDepartureTime);
        return actualDepartureTime;
    }
    
    private BigDecimal calculateRefund(Reservation reservation) {
        TrainClassDTO classDTO = ITrainClient.getClassById(reservation.getClassId()).getBody();
        return BigDecimal.valueOf(classDTO.getPrice() * reservation.getSeatCount());
    }
    
    private void validateBookingTime(TrainTrip trip, TrainDTO trainDTO) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trainDepartureTime = trip.getDepartureDateTime();
        LocalDate today = LocalDate.now();
        LocalDate journeyDate = trip.getJourneyDate();
        
        log.info("Booking validation - Current time: {}, Train departure: {}, Journey date: {}, Today: {}", 
                now, trainDepartureTime, journeyDate, today);
        
        // Only validate departure time if booking for today
        if (journeyDate.equals(today)) {
            if (now.isAfter(trainDepartureTime)) {
                throw new IllegalStateException(String.format(
                    "Cannot book ticket. Train has already departed at %s. Current time: %s", 
                    trainDepartureTime.toLocalTime(), now.toLocalTime()));
            }
            
            // Add minimum booking time (30 minutes before departure) for same day
            LocalDateTime cutoffTime = trainDepartureTime.minusMinutes(30);
            if (now.isAfter(cutoffTime)) {
                throw new IllegalStateException(String.format(
                    "Booking closed. Tickets must be booked at least 30 minutes before departure. Train departs at %s", 
                    trainDepartureTime.toLocalTime()));
            }
        }
        
        // For future dates, no time validation needed - user can book anytime
        log.info("Booking validation passed for journey date: {}", journeyDate);
    }

}
