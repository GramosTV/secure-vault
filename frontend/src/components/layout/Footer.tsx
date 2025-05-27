import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <span className="text-gray-600 text-sm">© 2025 SecureVault. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Terms of Service
            </a>
            <a href="/security" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Security
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            SecureVault uses industry-standard encryption algorithms to protect your data. Always use strong passwords
            and keep your credentials secure.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
