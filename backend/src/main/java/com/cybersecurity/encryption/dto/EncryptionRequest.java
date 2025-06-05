package com.cybersecurity.encryption.dto;

import com.cybersecurity.encryption.entity.EncryptionAlgorithm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncryptionRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Message is required")
    private String message;
    @NotNull(message = "Algorithm is required")
    private EncryptionAlgorithm algorithm;
    @NotBlank(message = "Key is required")
    private String key;
}
