package com.cybersecurity.encryption.dto;

import com.cybersecurity.encryption.entity.EncryptionAlgorithm;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncryptedMessageResponse {
    private Long id;
    private String title;
    private String encryptedContent;
    private EncryptionAlgorithm algorithm;
    private LocalDateTime createdAt;
}
