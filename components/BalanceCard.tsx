'use client';

interface BalanceCardProps {
  balance: string;
  publicKey: string;
  loading: boolean;
  onRefresh: () => void;
}

export default function BalanceCard({ balance, publicKey, loading, onRefresh }: BalanceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-earth-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-earth-800">Balance</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-accent-500 hover:text-accent-600 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-5xl font-bold text-primary-600 mb-2">
          {loading ? '...' : `${balance} XLM`}
        </p>
        <p className="text-earth-500 text-sm">Stellar Lumens</p>
      </div>

      <div className="bg-earth-50 rounded-lg p-4">
        <p className="text-xs text-earth-600 mb-1">Public Key</p>
        <p className="text-sm font-mono text-earth-800 break-all">{publicKey}</p>
      </div>
    </div>
  );
}

