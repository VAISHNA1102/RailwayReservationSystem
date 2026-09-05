package com.railway.reservation_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.reservation_service.controller.ReservationController;
import com.railway.reservation_service.dto.CancellationRequestDTO;
import com.railway.reservation_service.dto.CancellationResponseDTO;
import com.railway.reservation_service.dto.PassengerDTO;
import com.railway.reservation_service.dto.ReservationRequestDTO;
import com.railway.reservation_service.dto.ReservationResponseDTO;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.repository.TrainTripRepository;
import com.railway.reservation_service.repository.TripSeatInventoryRepository;
import com.railway.reservation_service.service.ReservationService;
import com.railway.reservation_service.service.TripGenerationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @MockBean
    private TrainTripRepository tripRepository;

    @MockBean
    private TripSeatInventoryRepository inventoryRepository;

    @MockBean
    private TripGenerationService tripGenerationService;

    @MockBean
    private ITrainClient trainClient;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Tests the makeReservation endpoint.
     */
    @Test
    void testMakeReservation() throws Exception {
        PassengerDTO passenger = PassengerDTO.builder()
                .name("John Doe")
                .age(30)
                .gender("Male")
                .address("123 Street")
                .windowSeatPreferred(true)
                .quota("General")
                .build();

        ReservationRequestDTO request = ReservationRequestDTO.builder()
                .userName("rahul123")
                .trainNumber("12345")
                .trainType("General")
                .classType("AC")
                .journeyDate(LocalDate.now().plusDays(1))
                .passengers(List.of(passenger))
                .build();

        ReservationResponseDTO response = ReservationResponseDTO.builder()
                .reservationId(1)
                .pnrNumber("ABC123")
                .trainNumber("12345")
                .trainName("Express")
                .classType("AC")
                .username("rahul123")
                .journeyDate(LocalDate.now().plusDays(1))
                .numberOfSeats(1)
                .totalFare(500.0)
                .reservationStatus("PENDING")
                .passengers(List.of(passenger))
                .build();

        Mockito.when(reservationService.makeReservation(any(ReservationRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/reservations/addReservation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pnrNumber").value("ABC123"));
    }


    /**
     * Tests the getReservationByPNR endpoint.
     */
    @Test
    void testGetReservationByPNR() throws Exception {
        ReservationResponseDTO response = ReservationResponseDTO.builder()
                .reservationId(1)
                .pnrNumber("ABC123")
                .trainNumber("12345")
                .trainName("Express")
                .classType("AC")
                .username("rahul123")
                .journeyDate(LocalDate.now().plusDays(1))
                .numberOfSeats(1)
                .totalFare(500.0)
                .reservationStatus("CONFIRMED")
                .build();

        Mockito.when(reservationService.getReservationByPNR("ABC123")).thenReturn(response);

        mockMvc.perform(get("/api/v1/reservations/getReservationByPNR/ABC123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pnrNumber").value("ABC123"));
    }


    /**
     * Tests the updateStatusByPNR endpoint.
     */
    @Test
    void testUpdateReservationStatus() throws Exception {
        Mockito.doNothing().when(reservationService).updateStatusByPNR("ABC123");

        mockMvc.perform(put("/api/v1/reservations/updateStatus/ABC123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Reservation status updated to: CONFIRMED"));
    }


    /**
     * Tests the cancelReservation endpoint.
     */
    @Test
    void testCancelReservation() throws Exception {
        CancellationRequestDTO cancellationRequest = new CancellationRequestDTO("Test reason");

        CancellationResponseDTO cancellationResponse = CancellationResponseDTO.builder()
                .pnr("ABC123")
                .status("CANCELLED")
                .refundAmount(BigDecimal.valueOf(500.0))
                .cancellationTime(LocalDateTime.now())
                .message("Ticket cancelled successfully. 100% refund will be processed.")
                .build();

        Mockito.when(reservationService.cancelReservation(eq("ABC123"), any(CancellationRequestDTO.class)))
                .thenReturn(cancellationResponse);

        mockMvc.perform(put("/api/v1/reservations/cancel/ABC123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancellationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pnr").value("ABC123"))
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }


    /**
     * Tests the getAllReservations endpoint.
     */
    @Test
    void testGetAllReservations() throws Exception {
        ReservationResponseDTO response = ReservationResponseDTO.builder()
                .reservationId(1)
                .pnrNumber("ABC123")
                .trainNumber("12345")
                .trainName("Express")
                .classType("AC")
                .username("rahul123")
                .journeyDate(LocalDate.now().plusDays(1))
                .numberOfSeats(1)
                .totalFare(500.0)
                .reservationStatus("CONFIRMED")
                .build();

        Mockito.when(reservationService.getAllReservations()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/reservations/allReservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pnrNumber").value("ABC123"));
    }


    /**
     * Tests the countAllReservations endpoint.
     */
    @Test
    void testCountAllReservations() throws Exception {
        Mockito.when(reservationService.countAllReservations()).thenReturn(5L);

        mockMvc.perform(get("/api/v1/reservations/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}
