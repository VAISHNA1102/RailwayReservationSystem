package com.railway.payment_service;

import com.railway.payment_service.dto.*;
import com.railway.payment_service.entity.*;
import com.railway.payment_service.feign.ReservationClient;
import com.railway.payment_service.feign.TrainClient;
import com.railway.payment_service.feign.UserClient;
import com.railway.payment_service.repository.IPaymentRepository;
import com.railway.payment_service.service.EmailService;
import com.railway.payment_service.service.PaymentServiceImpl;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceImplTest {

    @Mock
    private IPaymentRepository paymentRepository;

    @Mock
    private ReservationClient reservationClient;

    @Mock
    private TrainClient trainClient;

    @Mock
    private UserClient userClient;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private ReservationResponseDTO reservation;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);


        reservation = ReservationResponseDTO.builder()
                .reservationId(1)
                .pnrNumber("ABC123")
                .trainNumber(12345)
                .trainName("Express")
                .classType("AC")
                .username("rahul123")
                .journeyDate(LocalDate.now().plusDays(1))
                .numberOfSeats(2)
                .totalFare(500.0)
                .reservationStatus("PENDING")
                .passengers(List.of(PassengerDTO.builder()
                        .name("John")
                        .age(30)
                        .gender("Male")
                        .address("City")
                        .windowSeatPreferred(true)
                        .quota("General")
                        .build()))
                .build();

        userDTO = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();
    }


    /**
     * Tests successful initiation of the local checkout session.
     */
    @Test
    void testInitiateCheckout_Success() throws Exception {
        when(reservationClient.getReservationByPNR("ABC123")).thenReturn(ResponseEntity.ok(reservation));

        PaymentResponseDTO response = paymentService.initiateCheckout("ABC123");

        assertNotNull(response);
        assertEquals("Success", response.getStatus());
        assertEquals("LOCAL-ABC123", response.getSessionId());
    }



    /**
     * Tests counting of all payments.
     */
    @Test
    void testCountAllPayments() {
        when(paymentRepository.count()).thenReturn(5L);

        long count = paymentService.countAllPayments();

        assertEquals(5L, count);
    }


    /**
     * Tests retrieval of all payment records.
     */
    @Test
    void testGetAllPayments() {
        Payment payment = Payment.builder()
                .paymentId(1)
                .reservationId(101)
                .amount(500.0)
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod("CARD")
                .build();

        when(paymentRepository.findAll()).thenReturn(List.of(payment));

        List<Payment> result = paymentService.getAllPayments();

        assertEquals(1, result.size());
        assertEquals(PaymentStatus.SUCCESS, result.get(0).getPaymentStatus());
    }
}
