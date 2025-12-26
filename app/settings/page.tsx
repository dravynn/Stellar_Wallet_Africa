'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentNetwork, setNetwork, getNetworkConfig, type NetworkType } from '@/lib/network';
import SecurityWarning from '@/components/SecurityWarning';

export default function Settings() {
  const router = useRouter();
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('testnet');
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    setCurrentNetwork(getCurrentNetwork());
  }, []);

  const handleNetworkChange = (network: NetworkType) => {
    if (network === 'mainnet' && !warningShown) {
      if (!confirm('⚠️ WARNING: Switching to MAINNET!\n\nYou will be using real funds. Are you sure?')) {
        return;
      }
      setWarningShown(true);
    }
    setNetwork(network);
    setCurrentNetwork(network);
    alert(`Network switched to ${network.toUpperCase()}. Please refresh the page.`);
  };

  const config = getNetworkConfig();

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Back
          </Link>
        </div>

        <SecurityWarning />

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200">
          <h2 className="text-xl font-bold text-earth-800 mb-6">Network Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-3">Select Network</label>
              <div className="space-y-2">
                <button
                  onClick={() => handleNetworkChange('testnet')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    currentNetwork === 'testnet'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-earth-200 bg-white hover:bg-earth-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-earth-800">Testnet</p>
                      <p className="text-sm text-earth-600">For testing and development</p>
                    </div>
                    {currentNetwork === 'testnet' && (
                      <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleNetworkChange('mainnet')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    currentNetwork === 'mainnet'
                      ? 'border-red-500 bg-red-50'
                      : 'border-earth-200 bg-white hover:bg-earth-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-earth-800">Mainnet</p>
                      <p className="text-sm text-earth-600">⚠️ Real funds - Use with caution!</p>
                    </div>
                    {currentNetwork === 'mainnet' && (
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-earth-50 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold text-earth-800 mb-2">Current Network Info</p>
              <div className="space-y-1 text-sm text-earth-600">
                <p>Network: <span className="font-mono">{config.type.toUpperCase()}</span></p>
                <p>Horizon: <span className="font-mono text-xs">{config.horizonUrl}</span></p>
                {config.friendbotUrl && (
                  <p>Friendbot: <span className="font-mono text-xs">{config.friendbotUrl}</span></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

