package com.railway.train_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.train_service.controller.TrainController;
import com.railway.train_service.dto.*;
import com.railway.train_service.service.TrainService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TrainController.class)
class TrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TrainService trainService;

    @Autowired
    private ObjectMapper objectMapper;


    /**
     * Tests the addTrain endpoint.
     */
    @Test
    void testAddTrain() throws Exception {
        TrainRequestDTO request = TrainRequestDTO.builder()
                .trainNumber("12345")
                .trainName("Express")
                .trainType("General")
                .source("CityA")
                .destination("CityB")
                .departureTime(LocalDateTime.now().plusHours(1))
                .arrivalTime(LocalDateTime.now().plusHours(5))
                .runningDays(List.of("Monday", "Wednesday"))
                .availability(true)
                .trainClasses(List.of(TrainClassRequestDTO.builder()
                        .classType("AC")
                        .capacity(100)
                        .price(500.0)
                        .quota("General")
                        .build()))
                .build();

        TrainDTO response = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.addTrain(any(TrainRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/trains/addTrain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.trainNumber").value("12345"));
    }


    /**
     * Tests the getTrainById endpoint.
     */
    @Test
    void testGetTrainById() throws Exception {
        TrainDTO response = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.getTrainById(1)).thenReturn(response);

        mockMvc.perform(get("/api/v1/trains/getTrainById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainNumber").value("12345"));
    }


    /**
     * Tests the getClassById endpoint.
     */
    @Test
    void testGetClassById() throws Exception {
        TrainClassDTO response = TrainClassDTO.builder()
                .classId(1)
                .classType("AC")
                .capacity(100)
                .availableSeats(100)
                .price(500.0)
                .quota("General")
                .build();

        Mockito.when(trainService.getClassById(1)).thenReturn(response);

        mockMvc.perform(get("/api/v1/trains/getClassById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.classType").value("AC"));
    }


    /**
     * Tests the getTrainClassByTrainIdAndClassType endpoint.
     */
    @Test
    void testGetTrainClassByTrainIdAndClassType() throws Exception {
        TrainClassDTO response = TrainClassDTO.builder()
                .classId(1)
                .classType("AC")
                .capacity(100)
                .availableSeats(100)
                .price(500.0)
                .quota("General")
                .build();

        Mockito.when(trainService.getTrainClassByTrainIdAndClassType(1, "AC")).thenReturn(response);

        mockMvc.perform(get("/api/v1/trains/getTrainClassByTrainIdAndClassType/1/AC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.classType").value("AC"));
    }


    /**
     * Tests the getAllTrains endpoint.
     */
    @Test
    void testGetAllTrains() throws Exception {
        TrainDTO train = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.getAllTrains()).thenReturn(List.of(train));

        mockMvc.perform(get("/api/v1/trains/allTrains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].trainNumber").value("12345"));
    }


    /**
     * Tests the getTrainByNumber endpoint.
     */
    @Test
    void testGetTrainByNumber() throws Exception {
        String rawJson = "\"12345\""; // JSON string
        String receivedByController = "\"12345\"";

        TrainDTO response = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.getTrainByNumber(receivedByController)).thenReturn(response);

        mockMvc.perform(post("/api/v1/trains/getTrainByNumber")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainNumber").value("12345"));
    }


    /**
     * Tests the getAllTrainsByName endpoint.
     */
    @Test
    void testGetAllTrainsByName() throws Exception {
        TrainDTO train = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.getAllTrainsByName("Express")).thenReturn(List.of(train));

        mockMvc.perform(get("/api/v1/trains/getAllTrainsByName")
                        .param("trainName", "Express"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].trainName").value("Express"));
    }


    /**
     * Tests the updateTrain endpoint.
     */
    @Test
    void testUpdateTrain() throws Exception {
        UpdatedTrainRequestDTO request = UpdatedTrainRequestDTO.builder()
                .trainName("Updated Express")
                .trainType("Ladies")
                .source("CityA")
                .destination("CityC")
                .departureTime(LocalDateTime.now().plusHours(2))
                .arrivalTime(LocalDateTime.now().plusHours(6))
                .runningDays(List.of("Tuesday", "Thursday"))
                .availability(true)
                .trainClasses(List.of(TrainClassRequestDTO.builder()
                        .classType("AC")
                        .capacity(80)
                        .price(450.0)
                        .quota("Ladies")
                        .build()))
                .build();

        UpdatedTrainDTO response = UpdatedTrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Updated Express")
                .build();

        Mockito.when(trainService.updateTrain(eq("12345"), any(UpdatedTrainRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/trains/updateTrain/12345")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainName").value("Updated Express"));
    }


    /**
     * Tests the reduceSeats endpoint.
     */
    @Test
    void testReduceSeats() throws Exception {
        Mockito.doNothing().when(trainService).reduceSeats("12345", "AC", 10);

        mockMvc.perform(put("/api/v1/trains/reduceSeats")
                        .param("trainNumber", "12345")
                        .param("classType", "AC")
                        .param("seatsToReduce", "10"))
                .andExpect(status().isOk())
                .andExpect(content().string("Available seats reduced successfully."));
    }


    /**
     * Tests the deleteTrainByNumber endpoint.
     */
    @Test
    void testDeleteTrainByNumber() throws Exception {
        String expectedResponse = "Train with number 12345 deleted successfully!";

        Mockito.when(trainService.deleteTrainByNumber("\"12345\"")).thenReturn(expectedResponse);

        mockMvc.perform(delete("/api/v1/trains/deleteTrainByNumber")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"12345\""))
                .andExpect(status().isOk())
                .andExpect(content().string(expectedResponse));
    }


    /**
     * Tests the searchBySourceAndDestination endpoint.
     */
    @Test
    void testSearchBySourceAndDestination() throws Exception {
        TrainDTO train = TrainDTO.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .build();

        Mockito.when(trainService.searchBySourceAndDestination("CityA", "CityB")).thenReturn(List.of(train));

        mockMvc.perform(get("/api/v1/trains/search")
                        .param("source", "CityA")
                        .param("destination", "CityB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].trainNumber").value("12345"));
    }


    /**
     * Tests the countAllTrains endpoint.
     */
    @Test
    void testCountAllTrains() throws Exception {
        Mockito.when(trainService.countAllTrains()).thenReturn(5L);

        mockMvc.perform(get("/api/v1/trains/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}