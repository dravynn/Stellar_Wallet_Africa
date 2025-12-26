'use client';

import { useState, useEffect } from 'react';
import { getTransactions, type Transaction } from '@/lib/provider';

interface TransactionListProps {
  publicKey: string;
}

export default function TransactionList({ publicKey }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadTransactions();
    }
  }, [publicKey]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txs = await getTransactions(publicKey, 10);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-earth-200">
      <h2 className="text-2xl font-bold text-earth-800 mb-4">Recent Transactions</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-earth-500">
          <p>No transactions yet</p>
          <p className="text-sm mt-2">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-earth-50 rounded-lg hover:bg-earth-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-earth-800">{tx.type}</p>
                <p className="text-sm text-earth-500">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${tx.type === 'Received' ? 'text-accent-600' : 'text-primary-600'}`}>
                  {tx.type === 'Received' ? '+' : '-'}{tx.amount} {tx.asset}
                </p>
                {tx.hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-earth-500 hover:text-primary-500"
                  >
                    View on explorer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

