package com.cybersecurity.encryption.dto;

import com.cybersecurity.encryption.entity.EncryptedMessage.EncryptionAlgorithm;

import java.time.LocalDateTime;

public class EncryptedMessageResponse {

    private Long id;
    private String encryptedContent;
    private EncryptionAlgorithm algorithm;
    private LocalDateTime createdAt;

    // Constructors
    public EncryptedMessageResponse() {
    }

    public EncryptedMessageResponse(Long id, String encryptedContent,
            EncryptionAlgorithm algorithm, LocalDateTime createdAt) {
        this.id = id;
        this.encryptedContent = encryptedContent;
        this.algorithm = algorithm;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEncryptedContent() {
        return encryptedContent;
    }

    public void setEncryptedContent(String encryptedContent) {
        this.encryptedContent = encryptedContent;
    }

    public EncryptionAlgorithm getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(EncryptionAlgorithm algorithm) {
        this.algorithm = algorithm;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
