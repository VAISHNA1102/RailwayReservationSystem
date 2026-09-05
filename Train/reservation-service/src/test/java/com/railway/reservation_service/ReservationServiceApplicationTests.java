package com.railway.reservation_service;

import com.railway.reservation_service.feign.IPaymentClient;
import com.railway.reservation_service.feign.ITrainClient;
import com.railway.reservation_service.feign.IUserClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class ReservationServiceApplicationTests {

    @MockBean
    private IUserClient userClient;

    @MockBean
    private ITrainClient trainClient;

    @MockBean
    private IPaymentClient paymentClient;

    @Test
    void contextLoads() {
    }

}
