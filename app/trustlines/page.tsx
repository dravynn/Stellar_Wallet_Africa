'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredAddress, unlockWallet } from '@/lib/wallet';
import { getAllBalances, addTrustline, removeTrustline } from '@/lib/provider';
import SecurityWarning from '@/components/SecurityWarning';

export default function Trustlines() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [assetCode, setAssetCode] = useState('');
  const [assetIssuer, setAssetIssuer] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const storedAddress = getStoredAddress();
    if (!storedAddress) {
      router.push('/');
      return;
    }
    setAddress(storedAddress);
    loadTrustlines(storedAddress);
  }, [router]);

  const loadTrustlines = async (addr: string) => {
    try {
      const bal = await getAllBalances(addr);
      // Filter out XLM (native asset) as it doesn't need a trustline
      setBalances(bal.filter((b: any) => b.asset_type !== 'native'));
    } catch (error) {
      console.error('Failed to load trustlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrustline = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!assetCode.trim() || !assetIssuer.trim()) {
      setError('Please enter both asset code and issuer');
      return;
    }

    if (!isValidStellarAddress(assetIssuer)) {
      setError('Invalid issuer address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setProcessing(true);
    try {
      const keypair = await unlockWallet(password);
      await addTrustline(keypair, assetCode.trim(), assetIssuer.trim());
      setAssetCode('');
      setAssetIssuer('');
      setPassword('');
      setShowAddForm(false);
      if (address) await loadTrustlines(address);
    } catch (err: any) {
      setError(err.message || 'Failed to add trustline');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveTrustline = async (assetCode: string, assetIssuer: string) => {
    if (!confirm(`Are you sure you want to remove trustline for ${assetCode}?`)) {
      return;
    }

    const pwd = prompt('Enter your password to confirm:');
    if (!pwd) return;

    setProcessing(true);
    try {
      const keypair = await unlockWallet(pwd);
      await removeTrustline(keypair, assetCode, assetIssuer);
      if (address) await loadTrustlines(address);
    } catch (err: any) {
      setError(err.message || 'Failed to remove trustline');
    } finally {
      setProcessing(false);
    }
  };

  const isValidStellarAddress = (address: string): boolean => {
    return address.startsWith('G') && address.length === 56;
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
            Trustlines
          </h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Back
          </Link>
        </div>

        <SecurityWarning />

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-earth-800">Asset Trustlines</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold text-sm"
            >
              {showAddForm ? 'Cancel' : '+ Add Trustline'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTrustline} className="mb-6 p-4 bg-earth-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Asset Code</label>
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="USDT"
                  required
                  disabled={processing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Asset Issuer</label>
                <input
                  type="text"
                  value={assetIssuer}
                  onChange={(e) => setAssetIssuer(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                  placeholder="G..."
                  required
                  disabled={processing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Enter password"
                  required
                  disabled={processing}
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Add Trustline'}
              </button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : balances.length === 0 ? (
            <div className="text-center py-8 text-earth-500">
              <p>No trustlines found</p>
              <p className="text-sm mt-2">Add a trustline to receive non-native assets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((bal: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-earth-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-earth-800">{bal.asset_code}</p>
                    <p className="text-xs text-earth-600 font-mono">{bal.asset_issuer?.slice(0, 20)}...</p>
                    <p className="text-sm text-earth-700 mt-1">Balance: {parseFloat(bal.balance).toFixed(7)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveTrustline(bal.asset_code, bal.asset_issuer)}
                    disabled={processing}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

