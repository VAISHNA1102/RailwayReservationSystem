package com.railway.user_service.exception;

/**
 * Custom exception thrown when a field (like email, username, etc.)
 * already exists in the system and violates uniqueness constraints.
 */
public class FieldAlreadyExistException extends RuntimeException {
    public FieldAlreadyExistException(String message) {
        super(message);
    }
}
