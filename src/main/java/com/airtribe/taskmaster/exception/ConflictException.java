package com.airtribe.taskmaster.exception;

/** Thrown for state conflicts, e.g. duplicate username. Maps to HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
