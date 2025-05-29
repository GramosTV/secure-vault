import apiClient from './api';
import type { BackendEncryptionRequest, EncryptedMessage, AuthResponse } from '../types';

export async function testEncryption(): Promise<{
  success: boolean;
  message: string;
  result?: EncryptedMessage;
}> {
  try {
    console.log('Starting encryption functionality test...');

    const testUsername = `testuser_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test123';

    console.log('Step 1: Creating test user...');
    try {
      await apiClient.post('/auth/signup', {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });
      console.log('✅ Test user created successfully');
    } catch (signupError: any) {
      console.log('⚠️ User creation failed (might already exist):', signupError.message);
    }
    console.log('Step 2: Logging in...');
    const loginResponse = await apiClient.post<AuthResponse>('/auth/signin', {
      username: testUsername,
      password: testPassword,
    });

    console.log('✅ Login successful, received token');

    const originalToken = localStorage.getItem('authToken');
    localStorage.setItem('authToken', loginResponse.token);

    try {
      console.log('Step 3: Testing encryption...');
      const testRequest: BackendEncryptionRequest = {
        message: 'This is a test message for encryption functionality verification',
        algorithm: 'AES',
        key: 'test-encryption-key-123',
      };

      console.log('Sending request to /encrypt endpoint...');
      const response = await apiClient.post<any>('/encrypt', testRequest);

      console.log('✅ Encryption response received:', response);

      // Transform the backend response to match frontend expected format
      const encryptedMessage: EncryptedMessage = {
        id: response.id,
        title: 'Test Encryption',
        encryptedContent: response.encryptedContent,
        algorithm: testRequest.algorithm,
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || new Date().toISOString(),
        userId: loginResponse.user.id,
      };
      return {
        success: true,
        message: 'Encryption test completed successfully! ✅',
        result: encryptedMessage,
      };
    } finally {
      if (originalToken) {
        localStorage.setItem('authToken', originalToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  } catch (err: any) {
    console.error('❌ Encryption test failed:', err);

    let errorMessage = 'Unknown error';
    if (err.message) {
      errorMessage = err.message;
    }
    if (err.status) {
      errorMessage += ` (Status: ${err.status})`;
    }

    return {
      success: false,
      message: `Encryption test failed: ${errorMessage}`,
    };
  }
}
