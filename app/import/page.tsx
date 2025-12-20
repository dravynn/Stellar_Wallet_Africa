'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importWallet } from '@/lib/wallet';
import SecurityWarning from '@/components/SecurityWarning';

export default function ImportWallet() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await importWallet(mnemonic.trim(), password);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-earth-200">
          <h2 className="text-2xl font-bold text-earth-800 mb-6">Import Wallet</h2>
          
          <SecurityWarning />

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                placeholder="S..."
                required
                disabled={loading}
              />
              <p className="text-xs text-earth-500 mt-1">
                Enter your Stellar secret key (starts with S)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="Minimum 8 characters"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Wallet'}
            </button>
          </form>

          <button
            onClick={() => router.back()}
            className="w-full mt-4 px-6 py-3 bg-earth-100 text-earth-700 rounded-lg font-semibold hover:bg-earth-200"
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}

