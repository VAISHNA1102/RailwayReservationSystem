package com.railway.train_service;

import com.railway.train_service.dto.*;
import com.railway.train_service.entity.Train;
import com.railway.train_service.entity.TrainClass;
import com.railway.train_service.repository.TrainClassRepository;
import com.railway.train_service.repository.TrainRepository;
import com.railway.train_service.service.TrainServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrainServiceImplTest {

    @Mock
    private TrainRepository trainRepository;

    @Mock
    private TrainClassRepository trainClassRepository;

    @InjectMocks
    private TrainServiceImpl trainService;

    private Train train;
    private TrainClass trainClass;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        trainClass = TrainClass.builder()
                .classId(1)
                .classType("AC")
                .capacity(100)
                .availableSeats(100)
                .price(500.0)
                .quota("General")
                .build();

        train = Train.builder()
                .trainId(1)
                .trainNumber("12345")
                .trainName("Express")
                .trainType("General")
                .source("CityA")
                .destination("CityB")
                .departureTime(LocalDateTime.now().plusHours(1))
                .arrivalTime(LocalDateTime.now().plusHours(5))
                .runningDays(List.of("Monday", "Wednesday"))
                .availability(true)
                .trainClasses(new ArrayList<>(List.of(trainClass)))
                .build();

        trainClass.setTrain(train);
    }


    /**
     * Tests successful addition of a train.
     */
    @Test
    void testAddTrain_Success() {
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

        when(trainRepository.findByTrainNumber("12345")).thenReturn(Optional.empty());
        when(trainRepository.save(any(Train.class))).thenReturn(train);

        TrainDTO result = trainService.addTrain(request);

        assertEquals("12345", result.getTrainNumber());
        verify(trainRepository).save(any(Train.class));
    }


    /**
     * Tests successful retrieval of a train by its ID.
     */
    @Test
    void testGetTrainById_Success() {
        when(trainRepository.findById(1)).thenReturn(Optional.of(train));

        TrainDTO result = trainService.getTrainById(1);

        assertEquals("Express", result.getTrainName());
    }


    /**
     * Tests successful retrieval of a train by its number.
     */
    @Test
    void testGetTrainByNumber_Success() {
        when(trainRepository.findByTrainNumber("12345")).thenReturn(Optional.of(train));

        TrainDTO result = trainService.getTrainByNumber("12345");

        assertEquals("Express", result.getTrainName());
    }


    /**
     * Tests retrieval of all trains.
     */
    @Test
    void testGetAllTrains() {
        when(trainRepository.findAll()).thenReturn(List.of(train));

        List<TrainDTO> result = trainService.getAllTrains();

        assertEquals(1, result.size());
    }


    /**
     * Tests retrieval of trains by name.
     */
    @Test
    void testGetAllTrainsByName_Success() {
        when(trainRepository.findAllByTrainNameIgnoreCase("Express")).thenReturn(List.of(train));

        List<TrainDTO> result = trainService.getAllTrainsByName("Express");

        assertEquals(1, result.size());
    }


    /**
     * Tests search functionality by source and destination.
     */
    @Test
    void testSearchBySourceAndDestination() {
        when(trainRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase("CityA", "CityB")).thenReturn(List.of(train));

        List<TrainDTO> result = trainService.searchBySourceAndDestination("CityA", "CityB");

        assertEquals(1, result.size());
    }


    /**
     * Tests retrieval of a train class by its ID.
     */
    @Test
    void testGetClassById_Success() {
        when(trainRepository.findAll()).thenReturn(List.of(train));

        TrainClassDTO result = trainService.getClassById(1);

        assertEquals("AC", result.getClassType());
    }


    /**
     * Tests retrieval of a train class by train ID and class type.
     */
    @Test
    void testGetTrainClassByTrainIdAndClassType_Success() {
        when(trainRepository.findById(1)).thenReturn(Optional.of(train));

        TrainClassDTO result = trainService.getTrainClassByTrainIdAndClassType(1, "AC");

        assertEquals("AC", result.getClassType());
    }


    /**
     * Tests successful reduction of available seats in a train class.
     */
    @Test
    void testReduceSeats_Success() {
        when(trainRepository.findByTrainNumber("12345")).thenReturn(Optional.of(train));
        when(trainClassRepository.findByTrainAndClassType(train, "AC")).thenReturn(Optional.of(trainClass));
        when(trainClassRepository.save(any(TrainClass.class))).thenReturn(trainClass);

        trainService.reduceSeats("12345", "AC", 10);

        assertEquals(90, trainClass.getAvailableSeats());
    }



    /**
     * Tests successful update of a train and its classes.
     */
    @Test
    void testUpdateTrain_Success() {
        UpdatedTrainRequestDTO updateRequest = UpdatedTrainRequestDTO.builder()
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

        when(trainRepository.findByTrainNumber("12345")).thenReturn(Optional.of(train));
        when(trainClassRepository.findByTrainAndClassType(train, "AC")).thenReturn(Optional.of(trainClass));
        when(trainRepository.save(any(Train.class))).thenReturn(train);

        UpdatedTrainDTO result = trainService.updateTrain("12345", updateRequest);

        assertEquals("Updated Express", result.getTrainName());
        assertEquals("CityC", result.getDestination());
    }


    /**
     * Tests successful deletion of a train by its number.
     */
    @Test
    void testDeleteTrainByNumber_Success() {
        when(trainRepository.findByTrainNumber("12345")).thenReturn(Optional.of(train));

        String result = trainService.deleteTrainByNumber("12345");

        assertEquals("Train with number 12345 deleted successfully!", result);
        verify(trainRepository).delete(train);
    }


    /**
     * Tests counting of all trains.
     */
    @Test
    void testCountAllTrains() {
        when(trainRepository.countAllTrains()).thenReturn(5L);

        long count = trainService.countAllTrains();

        assertEquals(5L, count);
    }
}