package com.railway.reservation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trip_seat_inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tripId", "classId"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSeatInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;
    
    @Column(nullable = false)
    private Long tripId;
    
    @Column(nullable = false)
    private Integer classId;
    
    @Column(nullable = false)
    private Integer availableSeats;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer bookedSeats = 0;
    
    @Version
    private Integer version;
}