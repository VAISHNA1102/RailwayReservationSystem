package com.railway.reservation_service.exception;


/**
 * Custom exception thrown when a requested resource (e.g., user, train, reservation)
 * is not found in the system.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
