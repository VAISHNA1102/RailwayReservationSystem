package com.railway.train_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "train_class")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer classId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @Column(nullable = false)
    private String classType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String quota;
}
