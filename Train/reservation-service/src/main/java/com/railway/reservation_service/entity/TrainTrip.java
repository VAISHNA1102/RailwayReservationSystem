package com.railway.reservation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "train_trips", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trainId", "journeyDate"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;
    
    @Column(nullable = false)
    private Integer trainId;
    
    @Column(nullable = false)
    private LocalDate journeyDate;
    
    @Column(nullable = false)
    private LocalDateTime departureDateTime;
    
    @Column(nullable = false)
    private LocalDateTime arrivalDateTime;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TripStatus status = TripStatus.ACTIVE;
    
    @Version
    private Integer version;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}