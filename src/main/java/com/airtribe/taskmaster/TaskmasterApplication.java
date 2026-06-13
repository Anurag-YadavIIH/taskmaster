package com.airtribe.taskmaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application entry point.
 *
 * TaskMaster is a collaborative task tracking backend. The bootstrapping is
 * delegated entirely to Spring Boot's auto-configuration; component scanning
 * starts from this package (com.airtribe.taskmaster) and discovers all
 * controllers, services, repositories and configuration beans below it.
 */
@SpringBootApplication
public class TaskmasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskmasterApplication.class, args);
    }
}
