'use client';
import './globals.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui/styles.css';

// Dynamic imports for client-only components
const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const WalletModalProviderDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletModalProvider),
  { ssr: false }
);

export default function RootLayout({ children }) {
  const network = WalletAdapterNetwork.Mainnet;

  // ← THIS IS THE ONLY CHANGE YOU NEED
  const endpoint = 'https://mainnet.helius-rpc.com/?api-key=e4b02149-35ad-43f6-b943-57c12d3a41e8';

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ], [network]);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProviderDynamic>
              <div className="fixed top-4 right-4 z-50">
                <WalletMultiButtonDynamic style={{ background: '#00ff9d', color: '#000' }} />
              </div>
              {children}
            </WalletModalProviderDynamic>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}