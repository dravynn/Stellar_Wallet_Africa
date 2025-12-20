'use client';

import { useState } from 'react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
}

export default function ReceiveModal({ isOpen, onClose, publicKey }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-accent-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-earth-800">Receive Payment</h2>
          <button
            onClick={onClose}
            className="text-earth-400 hover:text-earth-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-earth-50 rounded-lg p-6 mb-4">
            <p className="text-xs text-earth-600 mb-2">Your Public Address</p>
            <p className="text-sm font-mono text-earth-800 break-all">{publicKey}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </>
            )}
          </button>
        </div>

        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <p className="text-sm text-earth-700">
            Share this address to receive Stellar Lumens (XLM). Make sure the sender uses the correct address.
          </p>
        </div>
      </div>
    </div>
  );
}

