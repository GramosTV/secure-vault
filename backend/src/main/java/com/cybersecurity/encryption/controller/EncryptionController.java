package com.cybersecurity.encryption.controller;

import com.cybersecurity.encryption.dto.*;
import com.cybersecurity.encryption.entity.User;
import com.cybersecurity.encryption.service.EncryptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class EncryptionController {

    @Autowired
    private EncryptionService encryptionService;

    @PostMapping("/encrypt")
    public ResponseEntity<?> encryptMessage(@Valid @RequestBody EncryptionRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            EncryptedMessageResponse response = encryptionService.createEncryptedMessage(request, user);
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
            String decryptedContent = encryptionService.decryptUserMessage(request, user);
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
            var response = encryptionService.getUserMessages(user, pageable, search);
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
            encryptionService.deleteUserMessage(id, user);
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
            var stats = encryptionService.getUserStats(user);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to fetch user stats: " + e.getMessage()));
        }
    }
}
