package com.railway.train_service.controller;

import com.railway.train_service.dto.*;
import com.railway.train_service.service.TrainService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trains")
public class TrainController {
    private final TrainService iTrainService;

    public TrainController(TrainService iTrainService) {
        this.iTrainService = iTrainService;
    }


    /**
     * Adds a new train to the system.
     */
    @PostMapping("/addTrain")
    public ResponseEntity<TrainDTO> addTrain(@Valid @RequestBody TrainRequestDTO trainRequestDTO) {
        TrainDTO response = iTrainService.addTrain(trainRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    /**
     * Retrieves a train by its ID.
     */
    @GetMapping("/getTrainById/{trainId}")
    public ResponseEntity<TrainDTO> getTrainById(@PathVariable Integer trainId) {
        TrainDTO response = iTrainService.getTrainById(trainId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Retrieves a train class by its class ID.
     */
    @GetMapping("/getClassById/{classId}")
    public TrainClassDTO getClassById(@PathVariable Integer classId) {
        return iTrainService.getClassById(classId);
    }


    /**
     * Retrieves a train class by train ID and class type.
     */
    @GetMapping("/getTrainClassByTrainIdAndClassType/{trainId}/{classType}")
    public ResponseEntity<TrainClassDTO> getTrainClassByTrainIdAndClassType(
            @PathVariable Integer trainId,
            @PathVariable String classType) {
        TrainClassDTO response = iTrainService.getTrainClassByTrainIdAndClassType(trainId, classType);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Retrieves all trains.
     */
    @GetMapping("/allTrains")
    public ResponseEntity<List<TrainDTO>> getAllTrains() {
        List<TrainDTO> response = iTrainService.getAllTrains();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Retrieves a train by its number.
     */
    @PostMapping("/getTrainByNumber")
    public ResponseEntity<TrainDTO> getTrainByNumber(@RequestBody String trainNumber) {
        TrainDTO response = iTrainService.getTrainByNumber(trainNumber);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Retrieves all trains by name.
     */
    @GetMapping("/getAllTrainsByName")
    public ResponseEntity<List<TrainDTO>> getAllTrainsByName(@RequestParam String trainName) {
        List<TrainDTO> response = iTrainService.getAllTrainsByName(trainName);
        return ResponseEntity.ok(response);
    }


    /**
     * Updates an existing train and its classes.
     */
    @PutMapping("/updateTrain/{trainNumber}")
    public ResponseEntity<UpdatedTrainDTO> updateTrain(@PathVariable String trainNumber, @Valid @RequestBody UpdatedTrainRequestDTO updatedTrainRequestDTO) {
        UpdatedTrainDTO response = iTrainService.updateTrain(trainNumber, updatedTrainRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Reduces available seats in a specific train class.
     */
    @PutMapping("/reduceSeats")
    public ResponseEntity<String> reduceSeats(@RequestParam String trainNumber, @RequestParam String classType, @RequestParam int seatsToReduce) {
        iTrainService.reduceSeats(trainNumber, classType, seatsToReduce);
        return ResponseEntity.status(HttpStatus.OK).body("Available seats reduced successfully.");
    }


    /**
     * Restores available seats in a specific train class.
     */
    @PutMapping("/increaseSeats")
    public ResponseEntity<String> increaseSeats(@RequestParam String trainNumber, @RequestParam String classType, @RequestParam int seatsToIncrease) {
        iTrainService.increaseSeats(trainNumber, classType, seatsToIncrease);
        return ResponseEntity.status(HttpStatus.OK).body("Available seats restored successfully.");
    }


    /**
     * Deletes a train by its number.
     */
    @DeleteMapping("/deleteTrainByNumber")
    public ResponseEntity<String> deleteTrainByNumber(@RequestBody String trainNumber) {
        String response = iTrainService.deleteTrainByNumber(trainNumber);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Searches trains by source and destination.
     */
    @GetMapping("/search")
    public ResponseEntity<List<TrainDTO>> searchBySourceAndDestination(
            @RequestParam String source,
            @RequestParam String destination) {
        List<TrainDTO> response = iTrainService.searchBySourceAndDestination(source, destination);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Returns the total number of trains.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAllTrains() {
        long count = iTrainService.countAllTrains();
        return ResponseEntity.status(HttpStatus.OK).body(count);
    }
}
