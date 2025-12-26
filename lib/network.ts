const NETWORK_KEY = 'stellar_network';

export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  type: NetworkType;
  horizonUrl: string;
  friendbotUrl?: string;
  networkPassphrase: string;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  testnet: {
    type: 'testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    type: 'mainnet',
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
};

export function getCurrentNetwork(): NetworkType {
  if (typeof window === 'undefined') return 'testnet';
  const stored = localStorage.getItem(NETWORK_KEY);
  return (stored as NetworkType) || 'testnet';
}

export function setNetwork(network: NetworkType): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NETWORK_KEY, network);
}

export function getNetworkConfig(): NetworkConfig {
  return NETWORKS[getCurrentNetwork()];
}

