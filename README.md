# Cybersecurity Lab

A modern encryption application for secure message sharing using industry-standard encryption algorithms.

## Overview

This application provides a platform for users to encrypt and decrypt messages using various encryption algorithms including AES, ChaCha20, and DES. It features a React-based frontend with a clean UI and a Spring Boot backend for handling encryption operations securely.

## Features

- **User Authentication**: Secure signup, login, and profile management
- **Multiple Encryption Algorithms**:
  - AES (Advanced Encryption Standard) - 256-bit encryption
  - ChaCha20 - Modern stream cipher with 256-bit keys
  - DES (Data Encryption Standard) - Included for educational purposes
- **Message Management**: Create, store, and decrypt encrypted messages
- **Security Features**:
  - JWT-based authentication
  - Password hashing
  - Key validation
  - Secure key generation
- **User-friendly Interface**: Clean, responsive design using Tailwind CSS

## Screenshots

### Login Screen

![Login Screen](screenshots/Screenshot%202025-05-29%20171429.png)

### Encryption Form

![Encryption Form](screenshots/Screenshot%202025-05-29%20171619.png)

### Message List

![Message List](screenshots/Screenshot%202025-05-29%20171657.png)

### Decryption Modal

![Decryption Modal](screenshots/Screenshot%202025-05-29%20171801.png)

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- React Hook Form for form validation
- Vite for fast development
- Yup for schema validation

### Backend

- Spring Boot
- Spring Security with JWT
- MySQL Database
- Flyway for database migrations
- Java Cryptography Architecture (JCA)

## Getting Started

### Prerequisites

- Node.js (v16+)
- Java JDK 17+
- MySQL 8.0+
- Maven

### Backend Setup

1. Configure database connection in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cybersecuritylab
spring.datasource.username=your_username
spring.datasource.password=your_password
```

2. Navigate to the backend directory and run:

```bash
mvn clean install
mvn spring-boot:run
```

3. The backend server will start on port 8080

### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. The frontend application will be available at http://localhost:5173

## Usage

### Account Creation

1. Create an account with a strong password
2. Login to access the encryption features

### Encrypting Messages

1. Navigate to the Encryption page
2. Enter a message title and content
3. Select an encryption algorithm
4. Generate or enter an encryption key
5. Click "Encrypt Message"

### Decrypting Messages

1. Open a message from your messages list
2. Enter the correct decryption key
3. Click "Decrypt Message"

## Security Best Practices

- **Key Management**: Never share encryption keys through insecure channels
- **Strong Passwords**: Use strong, unique passwords for your account
- **Algorithm Choice**: Use AES or ChaCha20 for sensitive data (DES is provided for educational purposes only)
- **Key Generation**: Always use the built-in key generator for maximum security

## Development

### Project Structure

- **Frontend**

  - `src/components`: UI components
  - `src/contexts`: React context providers
  - `src/pages`: Application pages
  - `src/utils`: Utility functions
  - `src/types`: TypeScript type definitions

- **Backend**
  - `src/main/java/com/cybersecurity/encryption/controller`: REST endpoints
  - `src/main/java/com/cybersecurity/encryption/service`: Business logic
  - `src/main/java/com/cybersecurity/encryption/security`: Security configuration
  - `src/main/java/com/cybersecurity/encryption/entity`: Database entities
  - `src/main/java/com/cybersecurity/encryption/repository`: Data access

## License

This project is licensed under the MIT License

## Acknowledgments

- This project was created as an educational resource for understanding modern encryption techniques
- The implementation follows best practices for secure application development
