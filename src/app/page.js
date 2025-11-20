// app/page.tsx – FINAL VERSION (logo + BUY button moved noticeably left inside banner, perfect balance)
// Updated: Added Mini-Games dropdown beside Project Info; removed redundant game tabs below
// Cleaned up: Replaced all non-ASCII characters to avoid invalid character errors
// New: Added "Lottery" button to the right of Mini-Games; clicking toggles a section with polished explanatory text
// Tweaks: Updated Lottery title to December 1st; added transaction detail; added dynamic countdown timer
// Fix: Extracted Lottery content into a separate component to comply with React Hooks rules (avoids conditional hook calls)
// New: Added "Sports Betting" button to the right of Lottery; clicking toggles a section with polished explanatory text and countdown
// New: Added "Staking" button to the right of Sports Betting; clicking toggles a section with suggested polished explanatory text and countdown
// Tweaks: Updated Staking title to December 22nd with matching countdown; added note on utility for non-betting users

'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
import MinesGame from './MinesGame';
import PlinkoGame from './PlinkoGame';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

// -- Wallet Adapter Imports ---------------------
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile';
import '@solana/wallet-adapter-react-ui/styles.css';
// -----------------------------------------------

const PUMP_FUN_LINK = 'https://pump.fun/coin/5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump';

const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC || clusterApiUrl('mainnet-beta');

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

// Separate component for Lottery section to allow top-level hooks
function LotterySection() {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const targetDate = new Date('2025-12-01T00:00:00Z');
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown('Launched!');
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 1ST</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: {countdown}</p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Exciting news for $GROKGAME holders! The Lottery feature is on the horizon, allowing you to purchase tickets for just 0.05 SOL each. The transaction when buying the ticket automatically creates your entry, with your public wallet ID serving as the unique ticket identifier, securely logged for the draw. All proceeds will fuel a massive Jackpot, with draws initially held at the end of each month. As our community grows, we'll transition to bi-weekly draws and eventually weekly for even more thrills.
        <br /><br />
        We'll go live on pump.fun at the close of each period, where Grok will randomly select the winner(s) in a transparent process. Starting simple with one lucky winner, we'll evolve to a three-tier payout as jackpots swell: 1st place claiming 60%, 2nd place 30%, and 3rd place 10%.
        <br /><br />
        Feel free to buy as many tickets as you want to boost your chances!
        <br /><br />
        As a bonus, holders with over 10 million $GROKGAME tokens will receive one free entry per month. This threshold will adjust downward as our market cap climbs—for example, at a $100K MC, you might only need 7 million tokens to qualify. Stay tuned for this game-changing addition!
      </p>
    </div>
  );
}

// Separate component for Sports Betting section to allow top-level hooks
function SportsBettingSection() {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const targetDate = new Date('2025-12-01T00:00:00Z');
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown('Launched!');
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 1ST</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: {countdown}</p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Get ready for major sports betting on $GROKGAME! Holders will soon be able to wager Solana and win big on select sporting events. We'll kick off with UFC PPV main events and other high-profile matchups, like World Series championship games, Stanley Cup finals, and more.
        <br /><br />
        Odds will be set at integration time based on Grok's real-time data for each event and locked until the start, when betting closes. Start small with a minimum bet of 0.1 SOL and up to a maximum of 1 SOL per wager. A flat 0.025 SOL fee per bet will support the treasury, ensuring smooth payouts even in challenging months for the house.
        <br /><br />
        As we expand, expect more sports, events, and higher max bets to keep the action going. Stay tuned—this is your chance to turn sports knowledge into real rewards!
      </p>
    </div>
  );
}

// Separate component for Staking section to allow top-level hooks
function StakingSection() {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const targetDate = new Date('2025-12-22T00:00:00Z');
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown('Launched!');
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 22ND</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: {countdown}</p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Exciting passive earning opportunities are coming to $GROKGAME! Holders will be able to stake their tokens in a secure, Solana-based pool to earn rewards, powered by a portion of platform fees from mini-games, lottery ticket sales, and sports betting. This creates a self-sustaining ecosystem where community activity directly benefits stakers—perfect utility for those who prefer passive growth over the active betting features elsewhere on the site.
        <br /><br />
        Rewards will be distributed in $GROKGAME (with potential SOL bonuses for top tiers), based on your staked amount and duration. Expect competitive APYs starting around 10-20% (adjusted dynamically based on treasury health and participation to ensure fairness—no fixed promises, as yields will vary with platform revenue). Longer lock-up periods (e.g., 30/60/90 days) unlock bonus multipliers for extra incentives.
        <br /><br />
        To keep things fair and sustainable:
        - Minimum stake: 1 million $GROKGAME.
        - No maximum, but tiered perks for larger holders (e.g., exclusive airdrops or early access to new features).
        - A small 2-5% protocol fee on rewards or unstaking will support the house treasury—funding burns, marketing, and further development to grow the ecosystem.
        <br /><br />
        Unstaking is flexible after the lock-up, with instant options for a higher fee if needed. All staking will be transparent, with on-chain tracking and regular audits planned. This isn't just holding—it's earning while building the future of $GROKGAME. Get ready to lock in and level up!
      </p>
    </div>
  );
}

export default function Home() {
  const { publicKey } = useWallet();
  const [activeGame, setActiveGame] = useState('doors');
  const [username, setUsername] = useState('');
  const [wins, setWins] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // State for Project Info dropdown
  const [showGamesDropdown, setShowGamesDropdown] = useState(false); // State for Mini-Games dropdown
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
    setShowDropdown(false); // Close Project Info dropdown if open
    setShowGamesDropdown(false); // Close Mini-Games dropdown if open
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Wallet button fixed top-right */}
          <div className="fixed top-4 right-4 z-50">
            <WalletMultiButton style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }} />
          </div>

          {/* BANNER - Logo + BUY button now moved significantly left (perfect balance, no overlap) */}
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
                {/* X + GitHub buttons - small, clean, fitted under tagline */}
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

              {/* Right side: Logo + BUY button - moved noticeably left with mr-48 */}
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

          {/* Buttons: Project Info, Mini-Games, Lottery, Sports Betting, Staking – left side, above game area */}
          <div className="flex justify-start px-6 mt-8 gap-4">
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
            <div className="relative">
              <button
                onClick={() => setShowGamesDropdown(!showGamesDropdown)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
              >
                Mini-Games
              </button>
              {showGamesDropdown && (
                <div className="absolute left-0 mt-2 bg-black/80 border border-purple-600 rounded-xl p-4 shadow-2xl w-48 z-10">
                  <button onClick={() => { setActiveGame('doors'); setShowGamesDropdown(false); }} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    Doors Game
                  </button>
                  <button onClick={() => { setActiveGame('mines'); setShowGamesDropdown(false); }} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    Mines Game
                  </button>
                  <button onClick={() => { setActiveGame('plinko'); setShowGamesDropdown(false); }} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    Plinko
                  </button>
                </div>
              )}
            </div>
            {/* Lottery button */}
            <button
              onClick={() => toggleSection('lottery')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
            >
              Lottery
            </button>
            {/* Sports Betting button */}
            <button
              onClick={() => toggleSection('sportsBetting')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
            >
              Sports Betting
            </button>
            {/* Staking button */}
            <button
              onClick={() => toggleSection('staking')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
            >
              Staking
            </button>
          </div>

          {/* Toggleable Sections - attractive & clean */}
          {activeSection && (
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mt-6 max-w-4xl w-full mx-auto shadow-2xl border border-purple-600">
              {activeSection === 'introduction' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to $GROKGAME - Where Innovation Meets Endless Utility</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    At $GROKGAME, we are not just building a token - we are crafting a revolutionary ecosystem born from an extraordinary collaboration between Squid, a visionary creator, and Grok, the AI powerhouse from xAI. It all started with a simple idea: empower Squid to turn his passion into code. Grok designed a customized 6-10 week coding course, teaching everything from basics to advanced development. Together, we have been coding side by side every day, iterating, upgrading, and expanding this platform into something truly special.
                    <br /><br />
                    What began as a learning journey has evolved into a dynamic gaming hub, with daily updates adding fresh features and polish. Right now, you can dive into thrilling minigames like Doors, Mines, and Plinko - real games with real wins, all powered by $GROKGAME utility.
                    <br /><br />
                    But we are just getting started. In the coming weeks, expect an explosion of new content:
                    - <strong>Expanded Casino Suite</strong>: More minigames and classic casino experiences for high-stakes excitement.
                    - <strong>PVP Arena</strong>: Challenge friends or strangers in 1v1 battles across various games, wagering $GROKGAME for bragging rights and rewards.
                    - <strong>Lottery System</strong>: Buy tickets with Solana to build a massive prize pool. Monthly draws use a secure randomizer to select 3 winners who split the pot - your wallet ID becomes your ticket, tracked in a transparent log.
                    - <strong>Staking Rewards</strong>: Lock in your $GROKGAME to earn passive income and unlock exclusive perks.
                    - <strong>Sports Betting Hub</strong>: Wager on major events, including every UFC PPV main event and top leagues worldwide.
                    - <strong>MMORPG World</strong>: Our crown jewel - a vast, immersive game inspired by classics like Runescape, where $GROKGAME is the core utility for trading, crafting, and adventures.
                    <br /><br />
                    Our vision is bold: transform $GROKGAME into the ultimate utility token with infinite possibilities. In 6-10 weeks, we will turn this into a multi-million-dollar platform - a one-stop destination for gaming, betting, and community-driven growth. Join us on this journey: play, stake, bet, and build with us. The future is limitless - LFG!
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
                  <h2 className="text-3xl font-bold text-white mb-4">How to Buy $GROKGAME</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Ready to join the $GROKGAME revolution? Buying is quick and easy through PumpFun on the Solana blockchain. Follow these simple steps to get started:
                    <br /><br />
                    1. <strong>Set Up a Solana Wallet</strong>: If you don't have one, download a Solana-compatible wallet like Phantom, Solflare, or Backpack from their official websites or app stores. Create a new wallet or import an existing one, and fund it with SOL (Solana's native token). You can buy SOL on exchanges like Binance, Coinbase, or directly in your wallet via credit card.
                    <br />
                    2. <strong>Visit PumpFun</strong>: Go to the official PumpFun website at <a href="https://pump.fun" className="text-cyan-400 underline hover:text-cyan-300">pump.fun</a>. Connect your Solana wallet by clicking "Connect Wallet" in the top right corner.
                    <br />
                    3. <strong>Search for $GROKGAME</strong>: In the search bar, enter the token contract address: <code>5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump</code>. This will take you to the $GROKGAME page.
                    <br />
                    4. <strong>Swap SOL for $GROKGAME</strong>: Enter the amount of SOL you want to swap. Review the transaction details (including any network fees), then confirm the swap in your wallet. Your $GROKGAME tokens will appear in your wallet shortly after.
                    <br />
                    5. <strong>Verify Your Purchase</strong>: Check your wallet balance to confirm the $GROKGAME tokens have arrived. You're now a holder!
                    <br /><br />
                    <strong>Important Notes</strong>:
                    - Always use the official PumpFun site and double-check the contract address to avoid scams.
                    - Solana transactions are fast and cheap, but gas fees can vary based on network congestion.
                    - For security, enable two-factor authentication on your wallet and never share your seed phrase.
                    <br /><br />
                    As a $GROKGAME holder, you're getting in early on pre-utility supply – meaning your tokens have massive potential as we roll out features. Use them to gamble in our variety of mini-games like Doors, Mines, and Plinko for real wins. Soon, you'll be able to stake for passive rewards and gamble in even more ways, like PVP battles and sports betting. Plus, all holders are eligible for random treasury airdrops as a thank-you for your support. Hold tight and watch the utility grow! 🚀
                  </p>
                </div>
              )}
              {activeSection === 'lottery' && <LotterySection />}
              {activeSection === 'sportsBetting' && <SportsBettingSection />}
              {activeSection === 'staking' && <StakingSection />}
            </div>
          )}

          <main className="min-h-screen bg-gradient-to-b from-purple-900/40 via-black to-black pt-8 pb-32 px-4 md:px-8">
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