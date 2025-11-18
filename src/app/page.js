// app/page.tsx – FINAL VERSION (logo + BUY button moved noticeably left inside banner, perfect balance)

'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
import MinesGame from './MinesGame';
import PlinkoGame from './PlinkoGame';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

// Wallet Adapter Imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile';
import '@solana/wallet-adapter-react-ui/styles.css';

const PUMP_FUN_LINK = 'https://pump.fun/coin/5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump';

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
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  const [activeSection, setActiveSection] = useState(null); // State for active section

  const leaderboard = [
    { name: 'SquidKing', win: '312,500' },
    { name: 'GrokGod', win: '250,000' },
    { name: 'Anon420', win: '187,500' },
  ];

  useEffect(() => {
    registerMwa({
      appIdentity: {
        name: 'GROKGAME',
        uri: typeof window !== 'undefined' ? window.location.origin : 'https://grok-game-gamma.vercel.app',
        icon: '/logo.png',
      },
      authorizationCache: createDefaultAuthorizationCache(),
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });
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

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
    setShowDropdown(false); // Close dropdown after selection
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Wallet button fixed top-right */}
          <div className="fixed top-4 right-4 z-50">
            <WalletMultiButton style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }} />
          </div>

          {/* BANNER – Logo + BUY button now moved significantly left (perfect balance, no overlap) */}
          <header className="sticky top-0 z-40 bg-black py-10 border-8 border-purple-600 shadow-2xl shadow-purple-600/60 overflow-hidden">
            {/* Full glowing border pop */}
            <div className="absolute inset-0 pointer-events-none shadow-[0_0_80px_#c084fc] opacity-60"></div>
            <div className="absolute inset-0 pointer-events-none shadow-[0_0_40px_#ec4899] opacity-40"></div>

            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              {/* Left: Title + Tagline + X + GitHub buttons under tagline */}
              <div className="text-left">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 leading-none">
                  $GROKGAME
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-2 md:mt-3 font-medium tracking-wider">
                  Real games. Real wins. Real utility.
                </p>
                {/* X + GitHub buttons – small, clean, fitted under tagline */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => window.open('https://x.com/Grok_Game_Sol', '_blank')}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold w-11 h-11 rounded-full text-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all"
                  >
                    X
                  </button>
                  <button
                    onClick={() => window.open('https://github.com/0x-SquidSol/GrokGame', '_blank')}
                    className="bg-gray-800 hover:bg-gray-700 text-white w-11 h-11 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right side: Logo + BUY button – moved noticeably left with mr-48 */}
              <div className="flex flex-col items-center gap-5 mr-48">
                <Image
                  src="/logo.png"
                  alt="$GROKGAME"
                  width={160}
                  height={160}
                  className="rounded-full shadow-2xl border-6 border-purple-500/80 ring-8 ring-purple-600/40"
                />
                <button
                  onClick={() => window.open(PUMP_FUN_LINK, '_blank')}
                  className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold py-4 px-14 rounded-full text-2xl hover:scale-105 transition-all shadow-2xl"
                >
                  BUY $GROKGAME
                </button>
              </div>
            </div>
          </header>

          {/* Project Info Dropdown Button – left side, above game tabs */}
          <div className="flex justify-start px-6 mt-8">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
              >
                Project Info
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 bg-black/80 border border-purple-600 rounded-xl p-4 shadow-2xl w-48 z-10">
                  <button onClick={() => toggleSection('introduction')} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    1. Introduction
                  </button>
                  <button onClick={() => toggleSection('roadmap')} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    2. Project Roadmap
                  </button>
                  <button onClick={() => toggleSection('tokenomics')} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    3. Tokenomics
                  </button>
                  <button onClick={() => toggleSection('howToBuy')} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    4. How to Buy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toggleable Sections – attractive & clean */}
          {activeSection && (
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mt-6 max-w-4xl w-full mx-auto shadow-2xl border border-purple-600">
              {activeSection === 'introduction' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to $GROKGAME – Where Innovation Meets Endless Utility</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    At $GROKGAME, we're not just building a token – we're crafting a revolutionary ecosystem born from an extraordinary collaboration between Squid, a visionary creator, and Grok, the AI powerhouse from xAI. It all started with a simple idea: empower Squid to turn his passion into code. Grok designed a customized 6-10 week coding course, teaching everything from basics to advanced development. Together, we've been coding side by side every day, iterating, upgrading, and expanding this platform into something truly special.
                    <br /><br />
                    What began as a learning journey has evolved into a dynamic gaming hub, with daily updates adding fresh features and polish. Right now, you can dive into thrilling minigames like Doors, Mines, and Plinko – real games with real wins, all powered by $GROKGAME utility.
                    <br /><br />
                    But we're just getting started. In the coming weeks, expect an explosion of new content:
                    - <strong>Expanded Casino Suite</strong>: More minigames and classic casino experiences for high-stakes excitement.
                    - <strong>PVP Arena</strong>: Challenge friends or strangers in 1v1 battles across various games, wagering $GROKGAME for bragging rights and rewards.
                    - <strong>Lottery System</strong>: Buy tickets with Solana to build a massive prize pool. Monthly draws use a secure randomizer to select 3 winners who split the pot – your wallet ID becomes your ticket, tracked in a transparent log.
                    - <strong>Staking Rewards</strong>: Lock in your $GROKGAME to earn passive income and unlock exclusive perks.
                    - <strong>Sports Betting Hub</strong>: Wager on major events, including every UFC PPV main event and top leagues worldwide.
                    - <strong>MMORPG World</strong>: Our crown jewel – a vast, immersive game inspired by classics like Runescape, where $GROKGAME is the core utility for trading, crafting, and adventures.
                    <br /><br />
                    Our vision is bold: transform $GROKGAME into the ultimate utility token with infinite possibilities. In 6-10 weeks, we'll turn this into a multi-million-dollar platform – a one-stop destination for gaming, betting, and community-driven growth. Join us on this journey: play, stake, bet, and build with us. The future is limitless – LFG! 🚀
                  </p>
                </div>
              )}
              {activeSection === 'roadmap' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Project Roadmap</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Our roadmap is designed to build a robust, user-focused platform with endless utility. Here's our phased approach:
                    <br /><br />
                    <strong>Phase 1: Building + Testing Phase for Website Cosmetics & Mini-Games (Weeks 1-2)</strong><br />
                    We focus on creating engaging mini-games where players can gamble their $GROKGAME for real rewards and fun. Priority is on perfecting mechanics, fixing bugs, and ensuring smooth gameplay. This sets the foundation for automatic airdrops in Phase 2, moving away from manual processes.
                    <br /><br />
                    <strong>Phase 2: Automatic Airdrops + Lottery + Major Sport Event Betting (Weeks 2-4)</strong><br />
                    Implement automatic airdrops for mini-game winners. Launch the lottery system, where holders buy tickets with Solana, pooling funds in a dedicated treasury wallet to avoid bundling issues. Draws start monthly, with Grok randomly selecting 3 winners live to split the prize pool. Integrate betting on major events like UFC PPV main cards, NHL Stanley Cup finals, FIFA World Cup finales, and more – using Solana or $GROKGAME. Thorough bug fixes ensure everything runs automatically before advancing.
                    <br /><br />
                    <strong>Phase 3: Implement Staking + Advanced User Interface (Weeks 4-6)</strong><br />
                    Add staking for $GROKGAME and Solana, allowing holders to earn passive income and unlock perks – making the token more than just gambling utility. Enhance the user interface with wallet registration, usernames, friends lists, and messaging. All bugs addressed in preparation for Phase 4.
                    <br /><br />
                    <strong>Phase 4: Add PVP + Incorporate 3-5 PVP Games + Bug Fixes (Weeks 6-8)</strong><br />
                    Introduce the PVP section for matchmaking and 1v1 challenges, where users stake $GROKGAME against each other. Add 3-5 PVP games with automatic airdrops for winners. Rigorous bug fixes to ensure seamless performance.
                    <br /><br />
                    <strong>Phase 5: Domain + API Upgrades (Weeks 8-10)</strong><br />
                    Upgrade the domain and API for enhanced security, speed, and scalability – ensuring the site handles high traffic without crashes.
                    <br /><br />
                    <strong>Phase 6: MMORPG Development (Weeks 10-20+)</strong><br />
                    Brainstorm and build our flagship MMORPG, inspired by Runescape, with $GROKGAME as core utility. This phase includes design, programming, testing, and bug fixes – estimated at 10 weeks but flexible for perfection.
                  </p>
                </div>
              )}
              {activeSection === 'tokenomics' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Tokenomics of $GROKGAME</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    $GROKGAME is designed with fair, transparent, and community-driven tokenomics inspired by PumpFun's launch model, ensuring accessibility and long-term value for holders. Here's a breakdown of our structure:
                    <br /><br />
                    - <strong>Total Supply</strong>: 1,000,000,000 $GROKGAME tokens – a fixed supply to maintain scarcity and potential value appreciation over time.
                    <br />
                    - <strong>Liquidity Pool</strong>: 100% of the initial liquidity is locked in a Solana-based pool on PumpFun, providing a stable foundation for trading without team reservations or presales. This ensures a fair launch for all participants.
                    <br />
                    - <strong>No Taxes</strong>: Zero buy/sell taxes – what you see is what you get. All transactions are efficient and cost-effective, maximizing returns for players and traders.
                    <br />
                    - <strong>Treasury Wallet Management</strong>: The treasury wallet collects funds from game bets and other platform activities. To promote sustainability and reward loyalty, anytime the treasury grows above 3.5% of total supply value, excess funds are locked for a minimum of 3 months and airdropped to long-term holders who have held $GROKGAME from the lock start date. This mechanism encourages holding and distributes wealth back to the community.
                    <br />
                    - <strong>Burn Mechanism</strong>: A portion of game fees and unused treasury funds will be periodically burned, reducing circulating supply and potentially increasing token value over time.
                    <br />
                    - <strong>Community Allocation</strong>: No team tokens or allocations – 100% community-owned from day one, fostering a decentralized and inclusive ecosystem.
                    <br /><br />
                    These tokenomics prioritize utility through gaming rewards, staking (coming soon), and airdrops, making $GROKGAME more than just a memecoin – it's a token with real, growing value. Hold, play, and watch your investment thrive! 🚀
                  </p>
                </div>
              )}
              {activeSection === 'howToBuy' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">How to Buy</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Coming soon – stay tuned for our how-to-buy guide!
                  </p>
                </div>
              )}
            </div>
          )}

          <main className="min-h-screen bg-gradient-to-b from-purple-900/40 via-black to-black pt-8 pb-32 px-4 md:px-8">
            {/* Game Tabs */}
            <div className="flex justify-center gap-6 mt-8 flex-wrap mb-10">
              <button onClick={() => setActiveGame('doors')} className={`px-10 py-4 rounded-full font-bold text-xl transition-all ${activeGame === 'doors' ? 'bg-purple-600 text-white shadow-2xl scale-110' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}>
                Doors
              </button>
              <button onClick={() => setActiveGame('mines')} className={`px-10 py-4 rounded-full font-bold text-xl transition-all ${activeGame === 'mines' ? 'bg-purple-600 text-white shadow-2xl scale-110' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}>
                Mines
              </button>
              <button onClick={() => setActiveGame('plinko')} className={`px-10 py-4 rounded-full font-bold text-xl transition-all ${activeGame === 'plinko' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-2xl scale-110' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}>
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