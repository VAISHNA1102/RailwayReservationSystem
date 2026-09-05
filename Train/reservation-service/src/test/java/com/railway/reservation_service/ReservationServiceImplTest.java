package com.railway.reservation_service;

import com.railway.reservation_service.dto.*;
import com.railway.reservation_service.entity.*;
import com.railway.reservation_service.exception.ResourceNotFoundException;
import com.railway.reservation_service.feign.IPaymentClient;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.feign.IUserClient;
import com.railway.reservation_service.repository.ReservationRepository;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.service.ReservationServiceImpl;
import com.railway.reservation_service.service.TripGenerationService;
import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import com.railway.reservation_service.dto.UserDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyDouble;

class ReservationServiceImplTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private IUserClient userClient;

    @Mock
    private ITrainClient trainClient;

    @Mock
    private IPaymentClient paymentClient;

    @Mock
    private TrainTripRepository tripRepository;

    @Mock
    private TripSeatInventoryRepository inventoryRepository;

    @Mock
    private TripGenerationService tripGenerationService;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private Reservation reservation;
    private ReservationRequestDTO requestDTO;
    private UserDTO userDTO;
    private TrainDTO trainDTO;
    private TrainClassDTO classDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        PassengerDTO passenger = PassengerDTO.builder()
                .name("John Doe")
                .age(30)
                .gender("Male")
                .address("123 Street")
                .windowSeatPreferred(true)
                .quota("General")
                .build();

        requestDTO = ReservationRequestDTO.builder()
                .userName("rahul123")
                .trainNumber("12345")
                .trainType("General")
                .classType("AC")
                .journeyDate(LocalDate.now().plusDays(1))
                .passengers(List.of(passenger))
                .build();

        userDTO = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        trainDTO = TrainDTO.builder()
                .trainId(101)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        classDTO = TrainClassDTO.builder()
                .classId(201)
                .classType("AC")
                .capacity(100)
                .availableSeats(100)
                .price(500.0)
                .quota("General")
                .build();

        reservation = Reservation.builder()
                .reservationId(1)
                .userName("rahul123")
                .trainId(101)
                .classId(201)
                .journeyDate(LocalDate.now().plusDays(1))
                .seatCount(2)
                .bookingStatus(BookingStatus.PENDING)
                .PNR("ABC123")
                .passengers(List.of(Passenger.builder()
                        .passengerId(1)
                        .name("John")
                        .age(30)
                        .gender("Male")
                        .address("City")
                        .windowSeatPreferred(true)
                        .quota("General")
                        .build()))
                .createdAt(LocalDateTime.now())
                .build();
    }


    /**
     * Tests successful reservation creation.
     */
    @Test
    void testMakeReservation_Success() {
        TrainTrip trip = TrainTrip.builder().tripId(1L).trainId(101).journeyDate(requestDTO.getJourneyDate())
                .departureDateTime(requestDTO.getJourneyDate().atTime(10, 0))
                .arrivalDateTime(requestDTO.getJourneyDate().atTime(14, 0)).build();
        TripSeatInventory inventory = TripSeatInventory.builder().tripId(1L).classId(201).availableSeats(100).bookedSeats(0).build();

        when(userClient.getUserByUserName("rahul123")).thenReturn(ResponseEntity.ok(userDTO));
        when(trainClient.getTrainByNumber("12345")).thenReturn(ResponseEntity.ok(trainDTO));
        when(tripRepository.findByTrainIdAndJourneyDate(101, requestDTO.getJourneyDate())).thenReturn(Optional.of(trip));
        when(trainClient.getTrainClassByTrainIdAndClassType(101, "AC")).thenReturn(ResponseEntity.ok(classDTO));
        when(inventoryRepository.findByTripIdAndClassId(1L, 201)).thenReturn(Optional.of(inventory));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation r = invocation.getArgument(0);
            r.setReservationId(1);
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });

        ReservationResponseDTO response = reservationService.makeReservation(requestDTO);

        assertNotNull(response);
        assertEquals("rahul123", response.getUsername());
        assertEquals("12345", response.getTrainNumber());
        assertEquals("AC", response.getClassType());
        assertEquals(500.0 * requestDTO.getPassengers().size(), response.getTotalFare());
        assertEquals(1, response.getPassengers().size());
    }


    /**
     * Tests reservation failure when user is not found.
     */
    @Test
    void testMakeReservation_UserNotFound() {
        when(userClient.getUserByUserName("rahul123")).thenReturn(ResponseEntity.ok(null));

        Exception exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.makeReservation(requestDTO));

        assertTrue(exception.getMessage().contains("User not found"));
    }


    /**
     * Tests reservation failure when train is not found.
     */
    @Test
    void testMakeReservation_TrainNotFound() {
        when(userClient.getUserByUserName("rahul123")).thenReturn(ResponseEntity.ok(userDTO));
        when(trainClient.getTrainByNumber("12345")).thenReturn(ResponseEntity.ok(null));

        Exception exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.makeReservation(requestDTO));

        assertTrue(exception.getMessage().contains("Train not found"));
    }


    /**
     * Tests reservation failure when class type is not found.
     */
    @Test
    void testMakeReservation_ClassNotFound() {
        TrainTrip trip = TrainTrip.builder().tripId(1L).trainId(101).journeyDate(requestDTO.getJourneyDate())
                .departureDateTime(requestDTO.getJourneyDate().atTime(10, 0))
                .arrivalDateTime(requestDTO.getJourneyDate().atTime(14, 0)).build();

        when(userClient.getUserByUserName("rahul123")).thenReturn(ResponseEntity.ok(userDTO));
        when(trainClient.getTrainByNumber("12345")).thenReturn(ResponseEntity.ok(trainDTO));
        when(tripRepository.findByTrainIdAndJourneyDate(101, requestDTO.getJourneyDate())).thenReturn(Optional.of(trip));
        when(trainClient.getTrainClassByTrainIdAndClassType(101, "AC")).thenReturn(ResponseEntity.ok(null));

        Exception exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.makeReservation(requestDTO));

        assertTrue(exception.getMessage().contains("Class type"));
    }


    /**
     * Tests reservation failure due to insufficient available seats.
     */
    @Test
    void testMakeReservation_InsufficientSeats() {
        classDTO.setAvailableSeats(0);
        TrainTrip trip = TrainTrip.builder().tripId(1L).trainId(101).journeyDate(requestDTO.getJourneyDate())
                .departureDateTime(requestDTO.getJourneyDate().atTime(10, 0))
                .arrivalDateTime(requestDTO.getJourneyDate().atTime(14, 0)).build();
        TripSeatInventory inventory = TripSeatInventory.builder().tripId(1L).classId(201).availableSeats(0).bookedSeats(100).build();

        when(userClient.getUserByUserName("rahul123")).thenReturn(ResponseEntity.ok(userDTO));
        when(trainClient.getTrainByNumber("12345")).thenReturn(ResponseEntity.ok(trainDTO));
        when(tripRepository.findByTrainIdAndJourneyDate(101, requestDTO.getJourneyDate())).thenReturn(Optional.of(trip));
        when(trainClient.getTrainClassByTrainIdAndClassType(101, "AC")).thenReturn(ResponseEntity.ok(classDTO));
        when(inventoryRepository.findByTripIdAndClassId(1L, 201)).thenReturn(Optional.of(inventory));

        Exception exception = assertThrows(IllegalStateException.class, () ->
                reservationService.makeReservation(requestDTO));

        assertTrue(exception.getMessage().contains("Only"));
    }


    /**
     * Tests successful retrieval of reservation by PNR.
     */
    @Test
    void testGetReservationByPNR_Success() {
        when(reservationRepository.findByPNR("ABC123")).thenReturn(Optional.of(reservation));
        when(trainClient.getTrainById(101)).thenReturn(ResponseEntity.ok(trainDTO));
        when(trainClient.getClassById(201)).thenReturn(ResponseEntity.ok(classDTO));

        ReservationResponseDTO response = reservationService.getReservationByPNR("ABC123");

        assertNotNull(response);
        assertEquals("ABC123", response.getPnrNumber());
        assertEquals("12345", response.getTrainNumber());
        assertEquals("Express", response.getTrainName());
        assertEquals("AC", response.getClassType());
        assertEquals("rahul123", response.getUsername());
        assertEquals(1000.0, response.getTotalFare());
    }


    /**
     * Tests successful update of reservation status to CONFIRMED.
     */
    @Test
    void testUpdateStatusByPNR_Success() {
        when(reservationRepository.findByPNR("ABC123")).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        reservationService.updateStatusByPNR("ABC123");

        assertEquals(BookingStatus.CONFIRMED, reservation.getBookingStatus());
        verify(reservationRepository).save(reservation);
    }


    /**
     * Tests successful cancellation of reservation.
     */
    @Test
    void testCancelReservation_Success() {
        reservation.setBookingStatus(BookingStatus.CONFIRMED);
        reservation.setTripId(null);
        when(reservationRepository.findByPNR("ABC123")).thenReturn(Optional.of(reservation));
        when(trainClient.getClassById(201)).thenReturn(ResponseEntity.ok(classDTO));
        when(trainClient.getTrainById(101)).thenReturn(ResponseEntity.ok(trainDTO));
        when(paymentClient.processRefund(anyInt(), anyDouble())).thenReturn(ResponseEntity.ok("Refund processed successfully"));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        CancellationRequestDTO cancellationRequest = new CancellationRequestDTO("Test reason");
        reservationService.cancelReservation("ABC123", cancellationRequest);

        assertEquals(BookingStatus.CANCELLED, reservation.getBookingStatus());
        verify(reservationRepository).save(reservation);
    }


    /**
     * Tests counting of all reservations.
     */
    @Test
    void testCountAllReservations() {
        when(reservationRepository.count()).thenReturn(10L);

        long count = reservationService.countAllReservations();

        assertEquals(10L, count);
    }


    /**
     * Tests retrieval of all reservations.
     */
    @Test
    void testGetAllReservations() {
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));
        when(trainClient.getTrainById(101)).thenReturn(ResponseEntity.ok(trainDTO));
        when(trainClient.getClassById(201)).thenReturn(ResponseEntity.ok(classDTO));

        List<ReservationResponseDTO> result = reservationService.getAllReservations();

        assertEquals(1, result.size());
        assertEquals("12345", result.get(0).getTrainNumber());
        assertEquals("Express", result.get(0).getTrainName());
        assertEquals("AC", result.get(0).getClassType());
    }
}
