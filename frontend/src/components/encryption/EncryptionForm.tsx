import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { EncryptionRequest, EncryptedMessage } from '../../types';
import apiClient from '../../utils/api';
import {
  generateAESKey,
  generateDESKey,
  generateChaCha20Key,
  textToAESKey,
  textToDESKey,
  textToChaCha20Key,
  getKeyValidationMessage,
  isValidBase64Key,
} from '../../utils/encryptionKeys';
import type { EncryptionAlgorithm } from '../../types/constants';

interface EncryptionFormProps {
  onEncryptionSuccess?: (message: EncryptedMessage) => void;
}

const EncryptionForm: React.FC<EncryptionFormProps> = ({ onEncryptionSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptedMessage, setEncryptedMessage] = useState<EncryptedMessage | null>(null);
  const [keyValidationMessage, setKeyValidationMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<EncryptionRequest>({
    defaultValues: {
      algorithm: 'AES',
      title: '',
      content: '',
      key: '',
    },
  });
  const watchedContent = watch('content', '');
  const watchedKey = watch('key', '');
  const watchedAlgorithm: EncryptionAlgorithm = watch('algorithm', 'AES');
  const contentLength = watchedContent.length;

  React.useEffect(() => {
    if (watchedKey) {
      const validation = getKeyValidationMessage(watchedAlgorithm, watchedKey);
      setKeyValidationMessage(validation);
    } else {
      setKeyValidationMessage(null);
    }
  }, [watchedKey, watchedAlgorithm]);
  const generateKey = () => {
    let newKey = '';
    switch (watchedAlgorithm) {
      case 'AES':
        newKey = generateAESKey(256); // Generate 256-bit AES key
        break;
      case 'DES':
        newKey = generateDESKey();
        break;
      case 'CHACHA20':
        newKey = generateChaCha20Key(); // Generate 256-bit ChaCha20 key
        break;
      default:
        return;
    }
    setValue('key', newKey);
  };
  const convertTextToKey = () => {
    const currentKey = getValues('key');
    if (!currentKey) return;

    let convertedKey = '';
    switch (watchedAlgorithm) {
      case 'AES':
        convertedKey = textToAESKey(currentKey, 256);
        break;
      case 'DES':
        convertedKey = textToDESKey(currentKey);
        break;
      case 'CHACHA20':
        convertedKey = textToChaCha20Key(currentKey);
        break;
      default:
        return;
    }
    setValue('key', convertedKey);
  };
  const copyKeyToClipboard = async () => {
    const currentKey = getValues('key');
    if (!currentKey) return;

    try {
      await navigator.clipboard.writeText(currentKey);
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy key to clipboard:', err);
    }
  };
  const onSubmit = async (data: EncryptionRequest) => {
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!data.title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }
    if (!data.content.trim()) {
      setError('Content is required');
      setIsLoading(false);
      return;
    }
    if (!data.key.trim()) {
      setError('Encryption key is required');
      setIsLoading(false);
      return;
    }
    if (!['AES', 'CHACHA20', 'DES'].includes(data.algorithm)) {
      setError('Invalid encryption algorithm');
      setIsLoading(false);
      return;
    }
    try {
      let processedKey = data.key;
      if (data.algorithm === 'AES') {
        if (!isValidBase64Key(data.key)) {
          processedKey = textToAESKey(data.key, 256);
        }
      } else if (data.algorithm === 'DES') {
        if (!isValidBase64Key(data.key, 'DES')) {
          processedKey = textToDESKey(data.key);
        }
      } else if (data.algorithm === 'CHACHA20') {
        if (!isValidBase64Key(data.key, 'CHACHA20')) {
          processedKey = textToChaCha20Key(data.key);
        }
      }
      // Transform the request to match backend expectations
      const backendRequest = {
        title: data.title,
        message: data.content,
        algorithm: data.algorithm,
        key: processedKey, // Using the processed encryption key
      };

      const response = await apiClient.post<any>('/encrypt', backendRequest);

      // Transform backend response to match frontend expected format
      const encryptedMessage: EncryptedMessage = {
        id: response.id,
        title: data.title, // Save the title from our form
        encryptedContent: response.encryptedContent,
        algorithm: data.algorithm,
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || new Date().toISOString(),
        userId: response.userId,
      };

      setEncryptedMessage(encryptedMessage);
      onEncryptionSuccess?.(encryptedMessage);
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to encrypt message');
    } finally {
      setIsLoading(false);
    }
  };
  const algorithmInfo = {
    AES: {
      name: 'AES (Advanced Encryption Standard)',
      description: 'Industry-standard symmetric encryption. Fast and secure for most use cases.',
      security: 'High',
      speed: 'Fast',
    },
    CHACHA20: {
      name: 'ChaCha20 (Stream Cipher)',
      description: 'Modern symmetric stream cipher. Fast, secure, and designed for high performance.',
      security: 'Very High',
      speed: 'Very Fast',
    },
    DES: {
      name: 'DES (Data Encryption Standard)',
      description: 'Legacy encryption. Included for educational purposes. Not recommended for sensitive data.',
      security: 'Low',
      speed: 'Fast',
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!encryptedMessage ? (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Encrypt Message</h2>
            <p className="text-gray-600">Secure your message using industry-standard encryption algorithms.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Message Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="input-field"
                placeholder="Enter a title for your message"
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="error-text" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>{' '}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                {...register('content')}
                id="content"
                rows={8}
                className="input-field resize-none"
                placeholder="Enter your secret message here..."
                aria-describedby={errors.content ? 'content-error' : 'content-info'}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content ? (
                  <p id="content-error" className="error-text" role="alert">
                    {errors.content.message}
                  </p>
                ) : (
                  <p id="content-info" className="text-sm text-gray-500">
                    Characters: {contentLength}/10,000
                  </p>
                )}
              </div>
            </div>{' '}
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                Encryption Key
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    {...register('key')}
                    type="password"
                    id="key"
                    className="input-field pr-32"
                    placeholder={
                      watchedAlgorithm === 'AES'
                        ? 'Enter key or generate Base64 key'
                        : watchedAlgorithm === 'DES'
                        ? 'Enter key or generate DES key'
                        : 'Enter key or generate ChaCha20 key'
                    }
                    aria-describedby={errors.key ? 'key-error' : undefined}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      type="button"
                      onClick={generateKey}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Generate new key"
                    >
                      Generate
                    </button>{' '}
                    {watchedKey && (
                      <button
                        type="button"
                        onClick={copyKeyToClipboard}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          copySuccess ? 'bg-green-500 text-white' : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                        title={copySuccess ? 'Copied!' : 'Copy key to clipboard'}
                      >
                        {copySuccess ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>{' '}
                {watchedAlgorithm === 'AES' && watchedKey && !isValidBase64Key(watchedKey) && (
                  <button
                    type="button"
                    onClick={convertTextToKey}
                    className="w-full px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    Convert text to Base64 AES key
                  </button>
                )}
                {watchedAlgorithm === 'CHACHA20' && watchedKey && !isValidBase64Key(watchedKey, 'CHACHA20') && (
                  <button
                    type="button"
                    onClick={convertTextToKey}
                    className="w-full px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    Convert text to Base64 ChaCha20 key
                  </button>
                )}
                {watchedAlgorithm === 'DES' && watchedKey && !isValidBase64Key(watchedKey, 'DES') && (
                  <button
                    type="button"
                    onClick={convertTextToKey}
                    className="w-full px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    Convert text to Base64 DES key
                  </button>
                )}
                {keyValidationMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      keyValidationMessage.includes('Valid')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                    }`}
                  >
                    {keyValidationMessage}
                  </div>
                )}
                {errors.key && (
                  <p id="key-error" className="error-text" role="alert">
                    {errors.key.message}
                  </p>
                )}{' '}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>This key will be required to decrypt your message later</p>
                  {watchedAlgorithm === 'AES' && (
                    <p className="text-xs">
                      <strong>AES:</strong> Keys must be Base64-encoded. Use "Generate" for secure keys or "Convert" for
                      text passwords.
                    </p>
                  )}
                  {watchedAlgorithm === 'DES' && (
                    <p className="text-xs">
                      <strong>DES:</strong> Uses 8-byte (64-bit) keys. Click "Generate" for a secure key.
                    </p>
                  )}
                  {watchedAlgorithm === 'CHACHA20' && (
                    <p className="text-xs">
                      <strong>ChaCha20:</strong> Uses 32-byte (256-bit) keys. Click "Generate" for a secure key.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Encryption Algorithm</label>
              <div className="space-y-3">
                {Object.entries(algorithmInfo).map(([key, info]) => (
                  <div key={key} className="relative">
                    <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        {...register('algorithm')}
                        type="radio"
                        value={key}
                        className="mt-1 mr-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{info.name}</h4>
                          <div className="flex space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                info.security === 'Very High'
                                  ? 'bg-green-100 text-green-800'
                                  : info.security === 'High'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {info.security} Security
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                info.speed === 'Fast' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {info.speed}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {errors.algorithm && (
                <p className="error-text mt-2" role="alert">
                  {errors.algorithm.message}
                </p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Security Notice</h4>
                  <p className="text-sm text-yellow-700">
                    Once encrypted, your original message cannot be recovered without proper decryption. Make sure to
                    remember any passwords or keys you set.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Encrypting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Encrypt Message
                </span>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Encrypted Successfully!</h2>
              <p className="text-gray-600">Your message has been securely encrypted and saved.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-sm text-gray-900">{encryptedMessage.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm Used</label>
                <p className="text-sm text-gray-900">{encryptedMessage.algorithm}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message ID</label>
                <p className="text-sm text-gray-900 font-mono">{encryptedMessage.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">{new Date(encryptedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>{' '}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEncryptedMessage(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Encrypt Another Message
              </button>
            </div>
          </div>
        </div>
      )}{' '}
    </div>
  );
};

export default EncryptionForm;
