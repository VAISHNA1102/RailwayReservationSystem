package com.railway.reservation_service.service;

import com.railway.reservation_service.dto.CancellationRequestDTO;
import com.railway.reservation_service.dto.CancellationResponseDTO;
import com.railway.reservation_service.dto.ReservationRequestDTO;
import com.railway.reservation_service.dto.ReservationResponseDTO;
import java.util.List;


public interface ReservationService {
    ReservationResponseDTO makeReservation(ReservationRequestDTO requestDTO);

    ReservationResponseDTO getReservationByPNR(String pnr);

    void updateStatusByPNR(String pnr);



    long countAllReservations();
    
    long countConfirmedReservations();
    
    long countCancelledReservations();

    List<ReservationResponseDTO> getAllReservations();

    List<ReservationResponseDTO> getReservationsByUser(String username);
    
    CancellationResponseDTO cancelReservation(String pnr, CancellationRequestDTO request);
    
    boolean isCancellable(String pnr);
}
