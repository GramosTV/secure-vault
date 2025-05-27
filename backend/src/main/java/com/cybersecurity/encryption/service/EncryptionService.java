package com.cybersecurity.encryption.service;

import com.cybersecurity.encryption.entity.EncryptedMessage.EncryptionAlgorithm;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class EncryptionService {

    public EncryptionResult encrypt(String message, String keyString, EncryptionAlgorithm algorithm) {
        try {
            switch (algorithm) {
                case AES:
                    return encryptAES(message, keyString);
                case RSA:
                    return encryptRSA(message, keyString);
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
                case RSA:
                    return decryptRSA(encryptedContent, keyString);
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
        // Generate or use provided key
        SecretKey secretKey;
        if (keyString == null || keyString.isEmpty()) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256);
            secretKey = keyGenerator.generateKey();
        } else {
            byte[] keyBytes = Base64.getDecoder().decode(keyString);
            secretKey = new SecretKeySpec(keyBytes, "AES");
        }

        // Generate random IV
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[16];
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Encrypt
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encryptedBytes = cipher.doFinal(message.getBytes());

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(secretKey.getEncoded()),
                Base64.getEncoder().encodeToString(iv));
    }

    private String decryptAES(String encryptedContent, String keyString, String ivString) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(keyString);
        byte[] ivBytes = Base64.getDecoder().decode(ivString);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedContent);

        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes);
    }

    private EncryptionResult encryptRSA(String message, String keyString) throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();

        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedBytes = cipher.doFinal(message.getBytes());

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(privateKey.getEncoded()),
                null // RSA doesn't use IV
        );
    }

    private String decryptRSA(String encryptedContent, String keyString) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(keyString);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedContent);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes);
    }

    private EncryptionResult encryptDES(String message, String keyString) throws Exception {
        // Generate or use provided key
        SecretKey secretKey;
        if (keyString == null || keyString.isEmpty()) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("DES");
            secretKey = keyGenerator.generateKey();
        } else {
            byte[] keyBytes = Base64.getDecoder().decode(keyString);
            secretKey = new SecretKeySpec(keyBytes, "DES");
        }

        // Generate random IV
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[8]; // DES uses 8-byte IV
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Encrypt
        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encryptedBytes = cipher.doFinal(message.getBytes());

        return new EncryptionResult(
                Base64.getEncoder().encodeToString(encryptedBytes),
                Base64.getEncoder().encodeToString(secretKey.getEncoded()),
                Base64.getEncoder().encodeToString(iv));
    }

    private String decryptDES(String encryptedContent, String keyString, String ivString) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(keyString);
        byte[] ivBytes = Base64.getDecoder().decode(ivString);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedContent);

        SecretKey secretKey = new SecretKeySpec(keyBytes, "DES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes);
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
