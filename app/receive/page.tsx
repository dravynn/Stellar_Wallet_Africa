'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredAddress } from '@/lib/wallet';

export default function Receive() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedAddress = getStoredAddress();
    if (!storedAddress) {
      router.push('/');
      return;
    }
    setAddress(storedAddress);
  }, [router]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Receive XLM
          </h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200">
          <div className="text-center mb-6">
            <div className="bg-earth-50 rounded-lg p-6 mb-4">
              <p className="text-xs text-earth-600 mb-2">Your Wallet Address</p>
              <p className="text-sm font-mono text-earth-800 break-all">{address}</p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
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
              Share this address to receive XLM on Stellar testnet. Make sure the sender uses the correct network.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

