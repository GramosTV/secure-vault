import React, { useState } from 'react';
import { testEncryption } from './utils/encryptionTest';

const EncryptionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; result?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    setLogs([]);

    // Override console.log temporarily to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      addLog(args.join(' '));
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      addLog(`ERROR: ${args.join(' ')}`);
      originalConsoleError(...args);
    };

    try {
      addLog('Starting encryption test...');
      const result = await testEncryption();
      setTestResult(result);
      addLog(`Test completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error('Test failed with error:', error);
      setTestResult({ success: false, message: 'Test failed with an unexpected error' });
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Encryption API Test</h1>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          This test will create a temporary user, login, and test the encryption functionality.
        </p>
        <button
          onClick={runTest}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Test...' : 'Run Encryption Test'}
        </button>
      </div>

      {/* Logs Section */}
      {logs.length > 0 && (
        <div className="mb-4 bg-gray-100 rounded p-4">
          <h3 className="font-semibold mb-2">Test Logs:</h3>
          <div className="max-h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {testResult && (
        <div
          className={`p-4 rounded-lg border-2 ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <h2 className={`font-bold text-lg mb-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.success ? '✅ Test Passed!' : '❌ Test Failed!'}
          </h2>
          <p className="mb-3">{testResult.message}</p>

          {testResult.success && testResult.result && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Encrypted Message Details:</h3>
              <pre className="overflow-x-auto text-sm bg-gray-50 p-3 rounded">
                {JSON.stringify(testResult.result, null, 2)}
              </pre>
            </div>
          )}

          {!testResult.success && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Make sure the backend server is running on port 8081</li>
                <li>Check that the MySQL database is connected</li>
                <li>Verify CORS settings allow frontend requests</li>
                <li>Check the browser console for detailed error messages</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EncryptionTest;
