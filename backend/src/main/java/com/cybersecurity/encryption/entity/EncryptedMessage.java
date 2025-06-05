package com.cybersecurity.encryption.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "encrypted_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncryptedMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 255)
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String encryptedContent;
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EncryptionAlgorithm algorithm;
    @Column(name = "encrypted_key", columnDefinition = "TEXT")
    private String encryptedKey;
    @Column(name = "initialization_vector")
    private String initializationVector;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
