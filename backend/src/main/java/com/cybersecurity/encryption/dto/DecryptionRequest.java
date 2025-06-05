package com.cybersecurity.encryption.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DecryptionRequest {
    @NotNull(message = "Message ID is required")
    private Long messageId;
    @NotBlank(message = "Key is required")
    private String key;
}
