'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWallet } from '@/lib/wallet';
import SecurityWarning from '@/components/SecurityWarning';

export default function CreateWallet() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
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
      const walletData = await createWallet(password);
      setMnemonic(walletData.publicKey); // For display, we'll show the public key
      // In a real app, show the secret key here for backup
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMnemonic = () => {
    // In production, show actual mnemonic here
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push('/home');
  };

  if (mnemonic) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-earth-200">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Wallet Created!</h2>
          <p className="text-earth-600 mb-6">
            Your wallet has been created successfully. Make sure to backup your secret key in a secure location.
          </p>
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold"
          >
            Go to Wallet
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-earth-200">
          <h2 className="text-2xl font-bold text-earth-800 mb-6">Create New Wallet</h2>
          
          <SecurityWarning />

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Password
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
              className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Wallet'}
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

