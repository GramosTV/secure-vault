package com.cybersecurity.encryption.controller;

import com.cybersecurity.encryption.dto.*;
import com.cybersecurity.encryption.entity.EncryptedMessage;
import com.cybersecurity.encryption.entity.User;
import com.cybersecurity.encryption.repository.EncryptedMessageRepository;
import com.cybersecurity.encryption.service.EncryptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EncryptionController {

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private EncryptedMessageRepository messageRepository;

    @PostMapping("/encrypt")
    public ResponseEntity<?> encryptMessage(@Valid @RequestBody EncryptionRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();

            EncryptionService.EncryptionResult result = encryptionService.encrypt(
                    request.getMessage(),
                    request.getKey(),
                    request.getAlgorithm());
            EncryptedMessage message = new EncryptedMessage(
                    request.getTitle(),
                    result.getEncryptedContent(),
                    request.getAlgorithm(),
                    result.getKey(),
                    result.getInitializationVector(),
                    user);

            message = messageRepository.save(message);

            EncryptedMessageResponse response = new EncryptedMessageResponse(
                    message.getId(),
                    message.getTitle(),
                    message.getEncryptedContent(),
                    message.getAlgorithm(),
                    message.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Encryption failed: " + e.getMessage()));
        }
    }

    @PostMapping("/decrypt")
    public ResponseEntity<?> decryptMessage(@Valid @RequestBody DecryptionRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();

            EncryptedMessage message = messageRepository.findById(request.getMessageId())
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            // Verify ownership
            if (!message.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Access denied"));
            }

            String decryptedContent = encryptionService.decrypt(
                    message.getEncryptedContent(),
                    request.getKey(),
                    message.getInitializationVector(),
                    message.getAlgorithm());

            return ResponseEntity.ok(Map.of("decryptedMessage", decryptedContent));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Decryption failed: " + e.getMessage()));
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Pageable pageable = PageRequest.of(page, size);

            Page<EncryptedMessage> messages;
            if (search != null && !search.trim().isEmpty()) {
                messages = messageRepository.findByUserAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(user,
                        search.trim(), pageable);
            } else {
                messages = messageRepository.findByUserOrderByCreatedAtDesc(user, pageable);
            }

            Page<EncryptedMessageResponse> response = messages.map(message -> new EncryptedMessageResponse(
                    message.getId(),
                    message.getTitle(),
                    message.getEncryptedContent(),
                    message.getAlgorithm(),
                    message.getCreatedAt()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to fetch messages: " + e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();

            EncryptedMessage message = messageRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            // Verify ownership
            if (!message.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Access denied"));
            }

            messageRepository.delete(message);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete message: " + e.getMessage()));
        }
    }

    @GetMapping("/user/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Long messageCount = messageRepository.countByUser(user);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMessages", messageCount);
            stats.put("user", new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getCreatedAt()));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to fetch user stats: " + e.getMessage()));
        }
    }
}
