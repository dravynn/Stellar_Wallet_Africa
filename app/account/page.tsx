'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredAddress } from '@/lib/wallet';
import { getServer } from '@/lib/provider';
import * as StellarSdk from '@stellar/stellar-sdk';

export default function AccountDetails() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAddress = getStoredAddress();
    if (!storedAddress) {
      router.push('/');
      return;
    }
    setAddress(storedAddress);
    loadAccountDetails(storedAddress);
  }, [router]);

  const loadAccountDetails = async (addr: string) => {
    try {
      const server = getServer();
      const acc = await server.loadAccount(addr);
      setAccount(acc);
    } catch (error) {
      console.error('Failed to load account details:', error);
    } finally {
      setLoading(false);
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
            Account Details
          </h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : account ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-earth-800 mb-3">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-earth-600">Sequence Number:</span>
                    <span className="font-mono text-earth-800">{account.sequenceNumber()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600">Subentry Count:</span>
                    <span className="font-mono text-earth-800">{account.subentryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600">Flags:</span>
                    <span className="font-mono text-earth-800">
                      {account.flags.authRequired ? 'Auth Required' : 'No Flags'}
                    </span>
                  </div>
                </div>
              </div>

              {account.signers && account.signers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-earth-800 mb-3">Signers</h3>
                  <div className="space-y-2">
                    {account.signers.map((signer: any, index: number) => (
                      <div key={index} className="p-3 bg-earth-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono text-earth-800">{signer.key}</span>
                          <span className="text-sm text-earth-600">Weight: {signer.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-earth-800 mb-3">Thresholds</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-earth-600">Low:</span>
                    <span className="font-mono text-earth-800">{account.thresholds.low_threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600">Medium:</span>
                    <span className="font-mono text-earth-800">{account.thresholds.med_threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600">High:</span>
                    <span className="font-mono text-earth-800">{account.thresholds.high_threshold}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-earth-800 mb-3">Balances</h3>
                <div className="space-y-2">
                  {account.balances.map((bal: any, index: number) => {
                    const assetName = bal.asset_type === 'native' 
                      ? 'XLM' 
                      : `${bal.asset_code} (${bal.asset_issuer?.slice(0, 8)}...)`;
                    return (
                      <div key={index} className="flex justify-between p-3 bg-earth-50 rounded-lg">
                        <span className="text-sm text-earth-700">{assetName}</span>
                        <span className="text-sm font-semibold text-earth-800">{parseFloat(bal.balance).toFixed(7)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-earth-500">
              <p>Failed to load account details</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

