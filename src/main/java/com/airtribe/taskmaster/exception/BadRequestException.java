package com.airtribe.taskmaster.exception;

/** Thrown for invalid client input that bean validation can't express. Maps to HTTP 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
