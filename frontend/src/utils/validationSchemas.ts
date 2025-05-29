import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const encryptionSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  content: yup
    .string()
    .required('Content is required')
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content cannot exceed 10,000 characters'),
  algorithm: yup
    .string()
    .required('Please select an encryption algorithm')
    .oneOf(['AES', 'CHACHA20', 'DES'], 'Invalid encryption algorithm'),
});

export const decryptionSchema = yup.object({
  password: yup.string().when('requiresPassword', {
    is: true,
    then: (schema) => schema.required('Password is required for decryption'),
    otherwise: (schema) => schema,
  }),
});
