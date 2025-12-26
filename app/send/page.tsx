'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredAddress, unlockWallet } from '@/lib/wallet';
import { getBalance, sendPayment } from '@/lib/provider';
import { getContacts, type Contact } from '@/lib/contacts';
import SecurityWarning from '@/components/SecurityWarning';

export default function Send() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContacts, setShowContacts] = useState(false);
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
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const isValidStellarAddress = (address: string): boolean => {
    try {
      // Stellar addresses start with G and are 56 characters
      return address.startsWith('G') && address.length === 56;
    } catch {
      return false;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidStellarAddress(to)) {
      setError('Invalid Stellar address. Must start with G and be 56 characters.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    if (!password) {
      setError('Please enter your password to confirm');
      return;
    }

    setLoading(true);
    try {
      const keypair = await unlockWallet(password);
      await sendPayment(keypair, to, amount, memo);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    } finally {
      setLoading(false);
      setPassword('');
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
            Send XLM
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
          <div className="mb-6">
            <p className="text-sm text-earth-600 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-primary-600">{balance} XLM</p>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-earth-700">
                  Recipient Address
                </label>
                <button
                  type="button"
                  onClick={() => setShowContacts(!showContacts)}
                  className="text-xs text-primary-500 hover:text-primary-600"
                >
                  {showContacts ? 'Hide' : 'Show'} Contacts
                </button>
              </div>
              {showContacts && (
                <div className="mb-2 p-2 bg-earth-50 rounded-lg max-h-40 overflow-y-auto">
                  {getContacts().length === 0 ? (
                    <p className="text-xs text-earth-500 text-center py-2">No contacts saved</p>
                  ) : (
                    getContacts().map((contact: Contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => {
                          setTo(contact.address);
                          if (contact.memo) setMemo(contact.memo);
                          setShowContacts(false);
                        }}
                        className="w-full text-left p-2 hover:bg-earth-100 rounded text-sm"
                      >
                        <div className="font-semibold text-earth-800">{contact.name}</div>
                        <div className="text-xs text-earth-600 font-mono">{contact.address.slice(0, 20)}...</div>
                      </button>
                    ))
                  )}
                </div>
              )}
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                placeholder="G..."
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Amount (XLM)
              </label>
              <input
                type="number"
                step="0.0000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="Optional memo"
                maxLength={28}
                disabled={loading}
              />
              <p className="text-xs text-earth-500 mt-1">Max 28 characters</p>
            </div>

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
              {loading ? 'Sending...' : 'Send Transaction'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

