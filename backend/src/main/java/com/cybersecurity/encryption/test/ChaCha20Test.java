package com.cybersecurity.encryption.test;

import com.cybersecurity.encryption.service.EncryptionService;
import com.cybersecurity.encryption.entity.EncryptedMessage.EncryptionAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simple test to verify ChaCha20 encryption/decryption works
 */
@Component
public class ChaCha20Test implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ChaCha20Test.class);

    @Autowired
    private EncryptionService encryptionService;

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Testing ChaCha20 encryption/decryption...");
            String testMessage = "Hello ChaCha20! This is a test message.";
            // Use a proper 32-byte Base64-encoded key for ChaCha20
            String testKey = "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="; // Base64 encoded 32-byte key

            // Test encryption
            EncryptionService.EncryptionResult encrypted = encryptionService.encrypt(
                    testMessage, testKey, EncryptionAlgorithm.CHACHA20);

            logger.info("Original message: {}", testMessage);
            logger.info("Encrypted content: {}", encrypted.getEncryptedContent());
            logger.info("IV: {}", encrypted.getInitializationVector()); // Test decryption
            String decrypted = encryptionService.decrypt(
                    encrypted.getEncryptedContent(),
                    testKey,
                    encrypted.getInitializationVector(),
                    EncryptionAlgorithm.CHACHA20);

            logger.info("Decrypted message: {}", decrypted);

            if (testMessage.equals(decrypted)) {
                logger.info("✅ ChaCha20 encryption/decryption test PASSED!");
            } else {
                logger.error("❌ ChaCha20 encryption/decryption test FAILED!");
            }

        } catch (Exception e) {
            logger.error("❌ ChaCha20 test failed with exception: ", e);
        }
    }
}
