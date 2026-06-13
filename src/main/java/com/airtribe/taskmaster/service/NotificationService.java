package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.response.NotificationResponse;
import com.airtribe.taskmaster.entity.Notification;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.exception.ResourceNotFoundException;
import com.airtribe.taskmaster.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Persists notifications and pushes them to connected clients in real time via
 * Server-Sent Events (SSE).
 *
 * Each user can have multiple open SSE connections (e.g. several browser tabs);
 * we keep a list of emitters per user id. When a notification is created we
 * save it and fan it out to every live emitter for that user.
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /** user id -> active SSE connections. */
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** Register a new SSE stream for a user and wire up cleanup callbacks. */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ignored) {
            // Client disconnected immediately; cleanup handlers will fire.
        }
        return emitter;
    }

    /** Create, persist and broadcast a notification for a recipient. */
    @Transactional
    public void notify(User recipient, String message, Long taskId) {
        Notification n = new Notification();
        n.setUser(recipient);
        n.setMessage(message);
        n.setTaskId(taskId);
        Notification saved = notificationRepository.save(n);

        List<SseEmitter> userEmitters = emitters.get(recipient.getId());
        if (userEmitters != null) {
            NotificationResponse payload = NotificationResponse.from(saved);
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("notification").data(payload));
                } catch (IOException e) {
                    removeEmitter(recipient.getId(), emitter);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Notification", notificationId));
        // Users may only mark their own notifications.
        if (!n.getUser().getId().equals(userId)) {
            throw ResourceNotFoundException.of("Notification", notificationId);
        }
        n.setRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(userId);
        }
    }
}
