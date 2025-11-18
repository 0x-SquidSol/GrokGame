// app/page.tsx

'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
import MinesGame from './MinesGame';
import PlinkoGame from './PlinkoGame';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

// ── Wallet Adapter Imports ──────────────────────
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile';
import '@solana/wallet-adapter-react-ui/styles.css';
// ──────────────────────────────────────────────────

const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC || clusterApiUrl('mainnet-beta');

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

export default function Home() {
  const { publicKey } = useWallet();
  const [activeGame, setActiveGame] = useState('doors');
  const [username, setUsername] = useState('');
  const [wins, setWins] = useState([]);
  const leaderboard = [
    { name: 'SquidKing', win: '312,500' },
    { name: 'GrokGod', win: '250,000' },
    { name: 'Anon420', win: '187,500' },
  ];

  // ── Mobile Wallet Standard Registration ──
  useEffect(() => {
    const uri = typeof window !== 'undefined' ? window.location.origin : 'https://grok-game-gamma.vercel.app';
    registerMwa({
      appIdentity: {
        name: 'GROKGAME',
        uri,
        icon: '/logo.png',
      },
      authorizationCache: createDefaultAuthorizationCache(),
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
      // Optional: Add for QR fallback on desktop (helps debug mobile issues)
      remoteHostAuthority: uri,
    });
    // Debug logging for mobile issues
    console.log('MWA registered with URI:', uri);
  }, []);

  useEffect(() => {
    if (publicKey && !username) {
      const saved = localStorage.getItem('grok_username');
      if (saved) setUsername(saved);
      else {
        const name = prompt('Enter your username for leaderboard:');
        if (name) {
          setUsername(name);
          localStorage.setItem('grok_username', name);
        }
      }
    }
  }, [publicKey]);

  const handleWin = async (amount, game) => {
    const win = { name: username || publicKey?.toBase58().slice(0, 6) || 'Anon', amount, game };
    setWins([win, ...wins.slice(0, 4)]);

    if (publicKey) {
      try {
        await fetch('/api/log-win', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicKey: publicKey.toBase58(),
            username: username || 'Anonymous',
            amount,
            game,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to save win log:', err);
      }
    }
  };

  const shareWin = (win) => {
    const text = `I just won ${win.amount} $GROKGAME on ${win.game} at https://grok-game-gamma.vercel.app! LFG infinity`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Connect Button – Top Right */}
          <div className="fixed top-4 right-4 z-50">
            <WalletMultiButton style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }} />
          </div>

          <main className="min-h-screen bg-gradient-to-b from-purple-900/50 via-black/50 to-black/50 p-4 md:p-8">
            <Image
              src="/logo.png"
              alt="$GROKGAME"
              width={180}
              height={180}
              className="rounded-full mb-6 shadow-2xl mx-auto"
            />
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 text-center">
              $GROKGAME
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mt-4 text-center">
              Real games. Real wins. Real utility.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => window.open('https://pump.fun/coin/5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump', '_blank')}
                className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold py-3 px-8 rounded-full text-xl hover:scale-105 transition shadow-lg"
              >
                BUY $GROKGAME
              </button>
              <button
                onClick={() => window.open('https://x.com/Grok_Game_Sol', '_blank')}
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-all"
              >
                X
              </button>
            </div>

            {/* Game Tabs */}
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <button
                onClick={() => setActiveGame('doors')}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all m-1 ${
                  activeGame === 'doors'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                Doors
              </button>
              <button
                onClick={() => setActiveGame('mines')}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all m-1 ${
                  activeGame === 'mines'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                Mines
              </button>
              <button
                onClick={() => setActiveGame('plinko')}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all m-1 ${
                  activeGame === 'plinko'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                Plinko
              </button>
            </div>

            {/* Active Game */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mt-6 max-w-4xl w-full mx-auto shadow-2xl">
              {activeGame === 'doors' ? (
                <DoorsGame onWin={handleWin} />
              ) : activeGame === 'mines' ? (
                <MinesGame onWin={handleWin} />
              ) : (
                <PlinkoGame onWin={handleWin} />
              )}
            </div>

            {/* Win Ticker */}
            {wins.length > 0 && (
              <div className="mt-8 bg-black/80 rounded-xl p-4 overflow-hidden shadow-xl">
                <div className="animate-marquee whitespace-nowrap">
                  {wins.concat(wins).map((w, i) => (
                    <span key={i} className="mx-8 text-green-400 font-bold inline-block">
                      {w.name} won {w.amount} on {w.game}!{' '}
                      <button
                        onClick={() => shareWin(w)}
                        className="ml-2 text-cyan-400 underline hover:text-cyan-300"
                      >
                        Share
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="mt-8 bg-black/60 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full mx-auto shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Leaderboard</h3>
              {leaderboard.map((l, i) => (
                <div key={i} className="flex justify-between text-lg mb-2 px-4">
                  <span className="text-gray-300">{i + 1}. {l.name}</span>
                  <span className="text-green-400 font-bold">{l.win}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-gray-400 text-sm text-center">
              More games weekly. Jackpot. Burn. LFG.
            </p>
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}