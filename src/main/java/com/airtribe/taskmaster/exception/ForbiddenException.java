package com.airtribe.taskmaster.exception;

/** Thrown when an authenticated user lacks rights for an action. Maps to HTTP 403. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
