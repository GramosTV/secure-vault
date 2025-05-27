import React, { useState } from 'react';
import type { EncryptedMessage, DecryptionResponse } from '../../types';
import apiClient from '../../utils/api';

interface DecryptionModalProps {
  message: EncryptedMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

const DecryptionModal: React.FC<DecryptionModalProps> = ({ message, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const handleDecrypt = async () => {
    if (!message) return;

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        messageId: message.id,
        password: password || undefined,
      };

      const response = await apiClient.post<DecryptionResponse>('/messages/decrypt', requestData);
      setDecryptedContent(response.decryptedContent);
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDecryptedContent(null);
    setError(null);
    setPassword('');
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        ></div>

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                {decryptedContent ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  {decryptedContent ? 'Decrypted Message' : 'Decrypt Message'}
                </h3>

                <div className="mt-2">
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message Title:</p>
                    <p className="text-sm text-gray-900">{message.title}</p>
                  </div>

                  {!decryptedContent ? (
                    <>
                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}{' '}
                      <div className="space-y-4">
                        {message.algorithm === 'AES' && (
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                              Decryption Password
                            </label>
                            <input
                              type="password"
                              id="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="input-field"
                              placeholder="Enter decryption password"
                              autoComplete="current-password"
                            />
                          </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <svg
                              className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
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
                              <p className="text-sm text-yellow-700">
                                {message.algorithm === 'AES'
                                  ? 'This message requires a password for decryption.'
                                  : 'This message will be decrypted using your private key.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDecrypt}
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
                              Decrypting...
                            </span>
                          ) : (
                            'Decrypt Message'
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <svg
                            className="h-5 w-5 text-green-600 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm font-medium text-green-800">Successfully Decrypted</p>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Decrypted Content:</label>
                        <div className="relative">
                          <textarea
                            value={decryptedContent}
                            readOnly
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm resize-none focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(decryptedContent)}
                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <svg
                            className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
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
                            <p className="text-sm text-red-700">
                              <strong>Security Notice:</strong> This decrypted content is now visible in plain text.
                              Make sure to secure your device and close this window when finished.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {decryptedContent ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecryptionModal;
