'use client';

import { useState, useEffect } from 'react';
import WalletHeader from '@/components/WalletHeader';
import BalanceCard from '@/components/BalanceCard';
import TransactionList from '@/components/TransactionList';
import SendModal from '@/components/SendModal';
import ReceiveModal from '@/components/ReceiveModal';
import { StellarWallet } from '@/lib/stellar-wallet';

export default function Home() {
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [publicKey, setPublicKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize wallet
    const initWallet = async () => {
      try {
        const newWallet = new StellarWallet();
        await newWallet.initialize();
        setWallet(newWallet);
        setPublicKey(newWallet.getPublicKey());
        setSecretKey(newWallet.getSecretKey());
        await loadBalance(newWallet);
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initWallet();
  }, []);

  const loadBalance = async (walletInstance: StellarWallet) => {
    try {
      setLoading(true);
      const bal = await walletInstance.getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (destination: string, amount: string) => {
    if (!wallet) return;
    try {
      setLoading(true);
      await wallet.sendPayment(destination, amount);
      await loadBalance(wallet);
      setIsSendOpen(false);
    } catch (error) {
      console.error('Failed to send payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFundAccount = async () => {
    if (!wallet) return;
    try {
      setLoading(true);
      await wallet.fundAccount();
      await loadBalance(wallet);
    } catch (error) {
      console.error('Failed to fund account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <WalletHeader />
        
        {wallet ? (
          <>
            <BalanceCard 
              balance={balance} 
              publicKey={publicKey}
              loading={loading}
              onRefresh={() => loadBalance(wallet)}
            />
            
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => setIsSendOpen(true)}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Send
              </button>
              <button
                onClick={() => setIsReceiveOpen(true)}
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Receive
              </button>
              <button
                onClick={handleFundAccount}
                disabled={loading}
                className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Funding...' : 'Fund Account'}
              </button>
            </div>

            <TransactionList publicKey={publicKey} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-earth-700">Initializing wallet...</p>
          </div>
        )}

        <SendModal
          isOpen={isSendOpen}
          onClose={() => setIsSendOpen(false)}
          onSend={handleSend}
          loading={loading}
        />

        <ReceiveModal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
          publicKey={publicKey}
        />
      </div>
    </main>
  );
}

