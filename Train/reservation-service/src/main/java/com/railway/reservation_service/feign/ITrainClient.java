package com.railway.reservation_service.feign;

import com.railway.reservation_service.dto.TrainClassDTO;
import com.railway.reservation_service.dto.TrainDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "trainservice")
public interface ITrainClient {
    @GetMapping("/api/v1/trains/getTrainById/{trainId}")
    ResponseEntity<TrainDTO> getTrainById(@PathVariable Integer trainId);

    @GetMapping("/api/v1/trains/getClassById/{classId}")
    ResponseEntity<TrainClassDTO> getClassById(@PathVariable Integer classId);

    @GetMapping("/api/v1/trains/getTrainClassByTrainIdAndClassType/{trainId}/{classType}")
    ResponseEntity<TrainClassDTO> getTrainClassByTrainIdAndClassType(
            @PathVariable Integer trainId,
            @PathVariable String classType);

    @PostMapping("/api/v1/trains/getTrainByNumber")
    ResponseEntity<TrainDTO> getTrainByNumber(@RequestBody String trainNumber);

    @PutMapping("/api/v1/trains/reduceSeats")
    ResponseEntity<String> reduceSeats(@RequestParam String trainNumber, @RequestParam String classType, @RequestParam int seatsToReduce);

    @PutMapping("/api/v1/trains/increaseSeats")
    ResponseEntity<String> increaseSeats(@RequestParam String trainNumber, @RequestParam String classType, @RequestParam int seatsToIncrease);
    
    @GetMapping("/api/v1/trains/allTrains")
    ResponseEntity<List<TrainDTO>> getAllTrains();
}
