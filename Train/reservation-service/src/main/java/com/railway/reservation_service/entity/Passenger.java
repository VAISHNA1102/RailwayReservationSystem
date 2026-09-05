package com.railway.reservation_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Passengers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "reservation")
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer passengerId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(nullable = false, length = 100)
    private String address;

    @Column
    private Integer seatNumber;

    @Column(length = 10)
    private String coachNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column
    private Boolean windowSeatPreferred;

    @Column(length = 20)
    private String quota;
}
