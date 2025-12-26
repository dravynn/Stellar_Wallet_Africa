'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasWallet } from '@/lib/wallet';
import SecurityWarning from '@/components/SecurityWarning';

export default function Onboarding() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (hasWallet()) {
      router.push('/unlock');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent mb-4">
            FREEDOM
          </h1>
          <p className="text-earth-700 text-lg">Non-Custodial Stellar Wallet for Ghana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-earth-200">
          <SecurityWarning />
          
          <div className="mt-6 space-y-4">
            <button
              onClick={() => router.push('/create')}
              className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Create New Wallet
            </button>
            
            <button
              onClick={() => router.push('/import')}
              className="w-full px-6 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Import Existing Wallet
            </button>
          </div>
        </div>

        <p className="text-center text-earth-600 text-sm mt-6">
          🔒 Your keys, your crypto. We never see your private keys.
        </p>
      </div>
    </main>
  );
}
