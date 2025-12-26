'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { unlockWallet } from '@/lib/wallet';
import SecurityWarning from '@/components/SecurityWarning';

export default function Export() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const keypair = await unlockWallet(password);
      setSecretKey(keypair.secret());
      setShowSecret(true);
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Export Secret Key
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
          {!showSecret ? (
            <>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-800 mb-2">⚠️ Security Warning</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Never share your secret key with anyone</li>
                  <li>• Anyone with your secret key can access your funds</li>
                  <li>• Store it in a secure, offline location</li>
                  <li>• Consider using a hardware wallet for large amounts</li>
                </ul>
              </div>

              <form onSubmit={handleExport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    Password (to confirm)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="Enter your password"
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
                  {loading ? 'Verifying...' : 'Show Secret Key'}
                </button>
              </form>
            </>
          ) : (
            <div>
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-semibold">
                  ⚠️ Keep this secret key safe! Anyone with access to it can control your wallet.
                </p>
              </div>

              <div className="bg-earth-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-earth-600 mb-2">Secret Key</p>
                <p className="text-sm font-mono text-earth-800 break-all">{secretKey}</p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mb-4"
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
                    Copy Secret Key
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/home')}
                className="w-full px-6 py-3 bg-earth-100 text-earth-700 rounded-lg font-semibold hover:bg-earth-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

