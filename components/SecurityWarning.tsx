'use client';

export default function SecurityWarning() {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-800 mb-2">Security Warnings</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This wallet stores data in browser localStorage</li>
            <li>• Browser storage can be accessed by malicious extensions</li>
            <li>• <strong>This is a TESTNET wallet (Stellar) - Do not use mainnet funds</strong></li>
            <li>• Always backup your mnemonic phrase securely</li>
            <li>• Never share your password or mnemonic with anyone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

