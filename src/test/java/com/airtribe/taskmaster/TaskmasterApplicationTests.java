package com.airtribe.taskmaster;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/** Smoke test: verifies the Spring application context starts successfully. */
@SpringBootTest
class TaskmasterApplicationTests {

    @Test
    void contextLoads() {
        // If the context fails to start, this test fails — catching wiring/config errors.
    }
}
