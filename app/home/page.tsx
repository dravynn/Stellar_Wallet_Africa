'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredAddress, clearWallet } from '@/lib/wallet';
import { getBalance, fundAccount, getAllBalances } from '@/lib/provider';
import SecurityWarning from '@/components/SecurityWarning';
import TransactionList from '@/components/TransactionList';

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [allBalances, setAllBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const storedAddress = getStoredAddress();
    if (!storedAddress) {
      router.push('/');
      return;
    }
    setAddress(storedAddress);
    loadBalance(storedAddress);
  }, [router]);

  const loadBalance = async (addr: string) => {
    try {
      const bal = await getBalance(addr);
      setBalance(parseFloat(bal).toFixed(4));
      
      // Load all balances (multi-asset support)
      const balances = await getAllBalances(addr);
      setAllBalances(balances);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (address) {
      setRefreshing(true);
      loadBalance(address);
    }
  };

  const handleLogout = () => {
    clearWallet();
    router.push('/');
  };

  const handleFundAccount = async () => {
    if (!address) return;
    setRefreshing(true);
    try {
      await fundAccount(address);
      await loadBalance(address);
    } catch (error) {
      console.error('Failed to fund account:', error);
    } finally {
      setRefreshing(false);
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
            FREEDOM
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Logout
          </button>
        </div>

        <SecurityWarning />

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-earth-800">Balance</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-accent-500 hover:text-accent-600 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-5xl font-bold text-primary-600 mb-2">
              {loading ? '...' : `${balance} XLM`}
            </p>
            <p className="text-earth-500 text-sm">Stellar Testnet</p>
          </div>

          <div className="bg-earth-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-earth-600 mb-1">Wallet Address</p>
            <p className="text-sm font-mono text-earth-800 break-all">{address}</p>
          </div>

          {/* Multi-asset balances */}
          {allBalances.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-earth-700 mb-2">All Assets</p>
              <div className="space-y-2">
                {allBalances.map((bal: any, index: number) => {
                  const assetName = bal.asset_type === 'native' 
                    ? 'XLM' 
                    : `${bal.asset_code} (${bal.asset_issuer?.slice(0, 8)}...)`;
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-earth-50 rounded">
                      <span className="text-sm text-earth-700">{assetName}</span>
                      <span className="text-sm font-semibold text-earth-800">{parseFloat(bal.balance).toFixed(7)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <TransactionList publicKey={address} />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Link
            href="/send"
            className="px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-center"
          >
            Send
          </Link>
          <Link
            href="/receive"
            className="px-6 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-center"
          >
            Receive
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleFundAccount}
            disabled={refreshing}
            className="px-6 py-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? 'Funding...' : 'Fund'}
          </button>
          <Link
            href="/export"
            className="px-6 py-4 bg-earth-500 hover:bg-earth-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-center"
          >
            Export Key
          </Link>
          <Link
            href="/account"
            className="px-6 py-4 bg-primary-400 hover:bg-primary-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-center"
          >
            Account
          </Link>
        </div>
      </div>
    </main>
  );
}

