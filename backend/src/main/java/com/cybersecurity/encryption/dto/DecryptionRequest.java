package com.cybersecurity.encryption.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DecryptionRequest {

    @NotNull(message = "Message ID is required")
    private Long messageId;

    @NotBlank(message = "Key is required")
    private String key;

    // Constructors
    public DecryptionRequest() {
    }

    public DecryptionRequest(Long messageId, String key) {
        this.messageId = messageId;
        this.key = key;
    }

    // Getters and Setters
    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
