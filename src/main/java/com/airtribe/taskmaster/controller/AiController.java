package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.request.GenerateDescriptionRequest;
import com.airtribe.taskmaster.dto.response.GeneratedTextResponse;
import com.airtribe.taskmaster.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Optional generative-AI helper. Disabled by default; see AiService and the
 * README for how to enable it with an Anthropic API key.
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Generative-AI helpers (optional feature)")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-description")
    @Operation(summary = "Generate a task description from a title and optional keywords")
    public ResponseEntity<GeneratedTextResponse> generate(
            @Valid @RequestBody GenerateDescriptionRequest request) {
        return ResponseEntity.ok(aiService.generateDescription(request));
    }
}
