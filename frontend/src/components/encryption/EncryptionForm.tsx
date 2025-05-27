import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { EncryptionRequest, EncryptedMessage } from '../../types';
import apiClient from '../../utils/api';

interface EncryptionFormProps {
  onEncryptionSuccess?: (message: EncryptedMessage) => void;
}

const EncryptionForm: React.FC<EncryptionFormProps> = ({ onEncryptionSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptedMessage, setEncryptedMessage] = useState<EncryptedMessage | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EncryptionRequest>({
    defaultValues: {
      algorithm: 'AES' as const,
      title: '',
      content: '',
    },
  });

  const watchedContent = watch('content', '');
  const contentLength = watchedContent.length;
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
    if (!['AES', 'RSA', 'DES'].includes(data.algorithm)) {
      setError('Invalid encryption algorithm');
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiClient.post<EncryptedMessage>('/messages/encrypt', data);
      setEncryptedMessage(result);
      onEncryptionSuccess?.(result);
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
    RSA: {
      name: 'RSA (Rivest-Shamir-Adleman)',
      description: 'Asymmetric encryption. More secure but slower, suitable for small data.',
      security: 'Very High',
      speed: 'Slower',
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
            </div>

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
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setEncryptedMessage(null)} className="flex-1 btn-primary">
                Encrypt Another Message
              </button>
              <a href="/messages" className="flex-1 btn-secondary text-center">
                View All Messages
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionForm;
