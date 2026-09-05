package com.railway.user_service.repository;

import com.railway.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUserName(String userName);


    /**
     * Counts the total number of users in the database.
     */
    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

}
