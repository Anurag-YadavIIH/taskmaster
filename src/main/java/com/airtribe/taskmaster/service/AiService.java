package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.GenerateDescriptionRequest;
import com.airtribe.taskmaster.dto.response.GeneratedTextResponse;
import com.airtribe.taskmaster.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Optional generative-AI feature: expands a short task title (and optional
 * keywords) into a clear, structured task description by calling the Anthropic
 * Messages API.
 *
 * Uses the JDK's built-in {@link HttpClient} (no extra HTTP dependency). The
 * feature is disabled by default — set {@code app.ai.enabled=true} and provide
 * {@code app.ai.api-key} (e.g. via the ANTHROPIC_API_KEY environment variable)
 * to turn it on. When disabled, the endpoint returns HTTP 400 with a helpful
 * message instead of failing obscurely.
 */
@Service
public class AiService {

    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final boolean enabled;
    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiService(
            @Value("${app.ai.enabled:false}") boolean enabled,
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.model:claude-sonnet-4-6}") String model,
            @Value("${app.ai.base-url:https://api.anthropic.com}") String baseUrl,
            ObjectMapper objectMapper) {
        this.enabled = enabled;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public GeneratedTextResponse generateDescription(GenerateDescriptionRequest req) {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException(
                    "AI features are disabled. Set app.ai.enabled=true and provide an API key to enable them.");
        }

        String prompt = """
                You are helping write a task for a task-tracking app.
                Given the task title and optional keywords, write a concise,
                actionable task description (2-4 sentences). Include any obvious
                acceptance criteria as a short bullet list. Do not repeat the
                title verbatim. Respond with the description text only.

                Title: %s
                Keywords: %s
                """.formatted(req.title(), req.keywords() == null ? "(none)" : req.keywords());

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 400,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/v1/messages"))
                    .timeout(Duration.ofSeconds(30))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() / 100 != 2) {
                throw new BadRequestException(
                        "AI request failed (HTTP " + response.statusCode() + "): " + response.body());
            }

            String text = extractText(objectMapper.readTree(response.body()));
            if (text.isBlank()) {
                throw new BadRequestException("AI service returned an empty response");
            }
            return new GeneratedTextResponse(text.trim());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("AI request failed: " + e.getMessage());
        }
    }

    /** The Messages API returns content as an array of typed blocks; pull the text. */
    private String extractText(JsonNode response) {
        if (response == null) return "";
        JsonNode content = response.get("content");
        if (content == null || !content.isArray()) return "";
        StringBuilder sb = new StringBuilder();
        for (JsonNode block : content) {
            if (block.has("type") && "text".equals(block.get("type").asText())) {
                sb.append(block.get("text").asText());
            }
        }
        return sb.toString();
    }
}
