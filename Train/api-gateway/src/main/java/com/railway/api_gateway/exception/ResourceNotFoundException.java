package com.railway.api_gateway.exception;


/**
 * Custom exception thrown when a requested resource is not found.
 * Used across the API Gateway for consistent error handling.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
