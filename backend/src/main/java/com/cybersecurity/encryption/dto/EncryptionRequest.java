package com.cybersecurity.encryption.dto;

import com.cybersecurity.encryption.entity.EncryptedMessage.EncryptionAlgorithm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EncryptionRequest {

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Algorithm is required")
    private EncryptionAlgorithm algorithm;

    @NotBlank(message = "Key is required")
    private String key;

    // Constructors
    public EncryptionRequest() {
    }

    public EncryptionRequest(String message, EncryptionAlgorithm algorithm, String key) {
        this.message = message;
        this.algorithm = algorithm;
        this.key = key;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public EncryptionAlgorithm getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(EncryptionAlgorithm algorithm) {
        this.algorithm = algorithm;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
