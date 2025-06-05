import type { EncryptionAlgorithm, UserRole } from './constants';

export interface User {
  id: number;
  username: string;
  email: string;
  roles?: UserRole[];
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken: string;
}

export interface EncryptedMessage {
  id: number;
  title: string;
  encryptedContent: string;
  algorithm: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface EncryptionRequest {
  title: string;
  content: string;
  key: string; // Added encryption key field
  algorithm: EncryptionAlgorithm;
}

// Backend compatible encryption request
export interface BackendEncryptionRequest {
  message: string;
  key: string;
  algorithm: EncryptionAlgorithm;
}

export interface DecryptionRequest {
  messageId: number;
  key: string;
}

export interface DecryptionResponse {
  decryptedContent: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
