import React from 'react';
import EncryptionTest from '../runEncryptionTest';

const TestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Encryption API Test</h1>
      <EncryptionTest />
    </div>
  );
};

export default TestPage;
