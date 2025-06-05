package com.cybersecurity.encryption.service;

import com.cybersecurity.encryption.dto.*;
import com.cybersecurity.encryption.entity.EncryptedMessage;
import com.cybersecurity.encryption.entity.EncryptionAlgorithm;
import com.cybersecurity.encryption.entity.User;
import com.cybersecurity.encryption.repository.EncryptedMessageRepository;
import org.bouncycastle.crypto.engines.ChaCha7539Engine;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.crypto.params.ParametersWithIV;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class EncryptionService {

    static {
        // Add Bouncy Castle provider
        Security.addProvider(new BouncyCastleProvider());
    }

    @Autowired
    private EncryptedMessageRepository messageRepository;

    public EncryptionResult encrypt(String message, String keyString, EncryptionAlgorithm algorithm) {
        try {
            switch (algorithm) {
                case AES:
                    return encryptAES(message, keyString);
                case CHACHA20:
                    return encryptChaCha20(message, keyString);
                case DES:
                    return encryptDES(message, keyString);
                default:
                    throw new IllegalArgumentException("Unsupported encryption algorithm: " + algorithm);
            }
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed: " + e.getMessage(), e);
        }
    }

    public String decrypt(String encryptedContent, String keyString, String ivString, EncryptionAlgorithm algorithm) {
        try {
            switch (algorithm) {
                case AES:
                    return decryptAES(encryptedContent, keyString, ivString);
                case CHACHA20:
                    return decryptChaCha20(encryptedContent, keyString, ivString);
                case DES:
                    return decryptDES(encryptedContent, keyString, ivString);
                default:
                    throw new IllegalArgumentException("Unsupported encryption algorithm: " + algorithm);
            }
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed: " + e.getMessage(), e);
        }
    }

    private EncryptionResult encryptAES(String message, String keyString) throws Exception {
        SecretKey secretKey;
        if (keyString == null || keyString.isEmpty()) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256);
            secretKey = keyGenerator.generateKey();
        } else {
            byte[] keyBytes;
            try {
                keyBytes = Base64.getDecoder().decode(keyString);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid key format. The AES key must be Base64 encoded. Error: " + e.getMessage());
            }

            if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
                throw new IllegalArgumentException(
                        "Invalid AES key length. AES keys must be 16, 24, or 32 bytes (128, 192, or 256 bits). Provided key is "
                                + keyBytes.length + " bytes.");
            }

            secretKey = new SecretKeySpec(keyBytes, "AES");
        }
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[16];
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encryptedBytes = cipher.doFinal(message.getBytes());

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(secretKey.getEncoded()),
                Base64.getEncoder().encodeToString(iv));
    }

    private String decryptAES(String encryptedContent, String keyString, String ivString) throws Exception {
        byte[] keyBytes;
        byte[] ivBytes;
        byte[] encryptedBytes;

        try {
            keyBytes = Base64.getDecoder().decode(keyString);
            ivBytes = Base64.getDecoder().decode(ivString);
            encryptedBytes = Base64.getDecoder().decode(encryptedContent);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid format for key, IV, or encrypted content. All must be Base64 encoded.");
        }
        if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
            throw new IllegalArgumentException(
                    "Invalid AES key length. AES keys must be 16, 24, or 32 bytes (128, 192, or 256 bits). Provided key is "
                            + keyBytes.length + " bytes.");
        }

        if (ivBytes.length != 16) {
            throw new IllegalArgumentException("Invalid IV length. AES IV must be 16 bytes (128 bits).");
        }

        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes);
    }

    private EncryptionResult encryptChaCha20(String message, String keyString) throws Exception {
        byte[] keyBytes;
        if (keyString == null || keyString.isEmpty()) {
            SecureRandom random = new SecureRandom();
            keyBytes = new byte[32];
            random.nextBytes(keyBytes);
        } else {
            try {
                keyBytes = Base64.getDecoder().decode(keyString);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid key format. The ChaCha20 key must be Base64 encoded. Error: " + e.getMessage());
            }

            if (keyBytes.length != 32) {
                throw new IllegalArgumentException(
                        "Invalid ChaCha20 key length. ChaCha20 keys must be exactly 32 bytes (256 bits). Provided key is "
                                + keyBytes.length + " bytes.");
            }
        }

        SecureRandom random = new SecureRandom();
        byte[] nonce = new byte[12];
        random.nextBytes(nonce);
        ChaCha7539Engine engine = new ChaCha7539Engine();
        KeyParameter keyParam = new KeyParameter(keyBytes);
        ParametersWithIV params = new ParametersWithIV(keyParam, nonce);

        engine.init(true, params);

        byte[] messageBytes = message.getBytes("UTF-8");
        byte[] encryptedBytes = new byte[messageBytes.length];
        engine.processBytes(messageBytes, 0, messageBytes.length, encryptedBytes, 0);

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(keyBytes),
                Base64.getEncoder().encodeToString(nonce));
    }

    private String decryptChaCha20(String encryptedContent, String keyString, String nonceString) throws Exception {
        byte[] keyBytes;
        byte[] nonceBytes;
        byte[] encryptedBytes;

        try {
            keyBytes = Base64.getDecoder().decode(keyString);
            nonceBytes = Base64.getDecoder().decode(nonceString);
            encryptedBytes = Base64.getDecoder().decode(encryptedContent);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid format for key, nonce, or encrypted content. All must be Base64 encoded.");
        }
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException(
                    "Invalid ChaCha20 key length. ChaCha20 keys must be exactly 32 bytes (256 bits). Provided key is "
                            + keyBytes.length + " bytes.");
        }

        if (nonceBytes.length != 12) {
            throw new IllegalArgumentException("Invalid nonce length. ChaCha20 nonce must be 12 bytes (96 bits).");
        }

        ChaCha7539Engine engine = new ChaCha7539Engine();
        KeyParameter keyParam = new KeyParameter(keyBytes);
        ParametersWithIV params = new ParametersWithIV(keyParam, nonceBytes);

        engine.init(false, params);

        byte[] decryptedBytes = new byte[encryptedBytes.length];
        engine.processBytes(encryptedBytes, 0, encryptedBytes.length, decryptedBytes, 0);

        return new String(decryptedBytes, "UTF-8");
    }

    private EncryptionResult encryptDES(String message, String keyString) throws Exception {
        SecretKey secretKey;
        if (keyString == null || keyString.isEmpty()) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("DES");
            secretKey = keyGenerator.generateKey();
        } else {
            byte[] keyBytes;
            try {
                keyBytes = Base64.getDecoder().decode(keyString);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid key format. The DES key must be Base64 encoded. Error: " + e.getMessage());
            }

            if (keyBytes.length != 8) {
                throw new IllegalArgumentException(
                        "Invalid DES key length. DES keys must be exactly 8 bytes (64 bits). Provided key is "
                                + keyBytes.length + " bytes.");
            }

            secretKey = new SecretKeySpec(keyBytes, "DES");
        }

        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[8];
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encryptedBytes = cipher.doFinal(message.getBytes());

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(secretKey.getEncoded()),
                Base64.getEncoder().encodeToString(iv));
    }

    private String decryptDES(String encryptedContent, String keyString, String ivString) throws Exception {
        byte[] keyBytes;
        byte[] ivBytes;
        byte[] encryptedBytes;

        try {
            keyBytes = Base64.getDecoder().decode(keyString);
            ivBytes = Base64.getDecoder().decode(ivString);
            encryptedBytes = Base64.getDecoder().decode(encryptedContent);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid format for key, IV, or encrypted content. All must be Base64 encoded.");
        }

        if (keyBytes.length != 8) {
            throw new IllegalArgumentException(
                    "Invalid DES key length. DES keys must be exactly 8 bytes (64 bits). Provided key is "
                            + keyBytes.length + " bytes.");
        }

        if (ivBytes.length != 8) {
            throw new IllegalArgumentException("Invalid IV length. DES IV must be 8 bytes (64 bits).");
        }

        SecretKey secretKey = new SecretKeySpec(keyBytes, "DES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes);
    }

    @Transactional
    public EncryptedMessageResponse createEncryptedMessage(EncryptionRequest request, User user) {
        EncryptionResult result = encrypt(request.getMessage(), request.getKey(), request.getAlgorithm());
        EncryptedMessage message = new EncryptedMessage(
                null,
                request.getTitle(),
                result.getEncryptedContent(),
                request.getAlgorithm(),
                result.getKey(),
                result.getInitializationVector(),
                user,
                null);
        message = messageRepository.save(message);
        return new EncryptedMessageResponse(
                message.getId(),
                message.getTitle(),
                message.getEncryptedContent(),
                message.getAlgorithm(),
                message.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public String decryptUserMessage(DecryptionRequest request, User user) {
        EncryptedMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return decrypt(
                message.getEncryptedContent(),
                request.getKey(),
                message.getInitializationVector(),
                message.getAlgorithm());
    }

    @Transactional(readOnly = true)
    public Page<EncryptedMessageResponse> getUserMessages(User user, Pageable pageable, String search) {
        Page<EncryptedMessage> messages;
        if (search != null && !search.trim().isEmpty()) {
            messages = messageRepository.findByUserAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(user, search.trim(),
                    pageable);
        } else {
            messages = messageRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }
        return messages.map(message -> new EncryptedMessageResponse(
                message.getId(),
                message.getTitle(),
                message.getEncryptedContent(),
                message.getAlgorithm(),
                message.getCreatedAt()));
    }

    @Transactional
    public void deleteUserMessage(Long id, User user) {
        EncryptedMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        messageRepository.delete(message);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats(User user) {
        Long messageCount = messageRepository.countByUser(user);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMessages", messageCount);
        stats.put("user", new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt()));
        return stats;
    }

    public static class EncryptionResult {
        private final String encryptedContent;
        private final String key;
        private final String initializationVector;

        public EncryptionResult(String encryptedContent, String key, String initializationVector) {
            this.encryptedContent = encryptedContent;
            this.key = key;
            this.initializationVector = initializationVector;
        }

        public String getEncryptedContent() {
            return encryptedContent;
        }

        public String getKey() {
            return key;
        }

        public String getInitializationVector() {
            return initializationVector;
        }
    }
}
