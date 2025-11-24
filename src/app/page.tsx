'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
import MinesGame from './MinesGame';
import PlinkoGame from './PlinkoGame';
import BlackjackGame from './BlackjackGame';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile';
import '@solana/wallet-adapter-react-ui/styles.css';

const PUMP_FUN_LINK = 'https://pump.fun/coin/5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump';
const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC || clusterApiUrl('mainnet-beta');

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

/* ====================== COUNTDOWN REUSABLE ====================== */
function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const timer = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTime('Launched!');
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-bold">{time}</span>;
}

/* ====================== FULL DETAILED SECTIONS ====================== */
const IntroductionSection = () => (
  <>
    <h2 className="text-3xl font-bold text-white mb-6">Welcome to $GROKGAME - Where Innovation Meets Endless Utility</h2>
    <p className="text-gray-300 text-lg leading-relaxed">
      At $GROKGAME, we are not just building a token - we are crafting a revolutionary ecosystem born from an extraordinary collaboration between Squid, a visionary creator, and Grok, the AI powerhouse from xAI. It all started with a simple idea: empower Squid to turn his passion into code. Grok designed a customized 6-10 week coding course, teaching everything from basics to advanced development. Together, we have been coding side by side every day, iterating, upgrading, and expanding this platform into something truly special.<br /><br />
      What began as a learning journey has evolved into a dynamic gaming hub, with daily updates adding fresh features and polish. Right now, you can dive into thrilling minigames like Doors, Mines, and Plinko - real games with real wins, all powered by $GROKGAME utility.<br /><br />
      But we are just getting started. In the coming weeks, expect an explosion of new content:<br />
      • Expanded Casino Suite • PVP Arena • Lottery System • Sports Betting • Staking • Flagship MMORPG<br /><br />
      Our vision is bold: transform $GROKGAME into the ultimate utility token with infinite possibilities. In 6-10 weeks, we will turn this into a multi-million-dollar platform. Join us on this journey: play, stake, bet, and build with us. The future is limitless - LFG!
    </p>
  </>
);

const RoadmapSection = () => (
  <>
    <h2 className="text-3xl font-bold text-white mb-6">Project Roadmap</h2>
    <p className="text-gray-300 text-lg leading-relaxed">
      Our roadmap is designed to build a robust, user-focused platform with endless utility. Here's our phased approach:<br /><br />
      <strong>Phase 1: Building + Testing Phase for Website Cosmetics & Mini-Games (Weeks 1-2)</strong><br />
      <strong>Phase 2: Automatic Airdrops + Lottery + Major Sport Event Betting (Weeks 2-4)</strong><br />
      <strong>Phase 3: Implement Staking + Advanced User Interface (Weeks 4-6)</strong><br />
      <strong>Phase 4: Add PVP + Incorporate 3-5 PVP Games + Bug Fixes (Weeks 6-8)</strong><br />
      <strong>Phase 5: Domain + API Upgrades (Weeks 8-10)</strong><br />
      <strong>Phase 6: MMORPG Development (Weeks 10-20+)</strong><br /><br />
      Brainstorm and build our flagship MMORPG, inspired by Runescape, with $GROKGAME as core utility.
    </p>
  </>
);

const TokenomicsSection = () => (
  <>
    <h2 className="text-3xl font-bold text-white mb-6">Tokenomics of $GROKGAME</h2>
    <p className="text-gray-300 text-lg leading-relaxed">
      $GROKGAME is designed with fair, transparent, and community-driven tokenomics inspired by PumpFun's launch model.<br /><br />
      • <strong>Total Supply</strong>: 1,000,000,000 $GROKGAME tokens — fixed supply<br />
      • <strong>Liquidity Pool</strong>: 100% of initial liquidity locked on PumpFun<br />
      • <strong>No Taxes</strong>: Zero buy/sell taxes<br />
      • <strong>Treasury Management</strong>: When treasury &gt; 3.5% of total supply value → excess locked 3 months & airdropped to long-term holders<br />
      • <strong>Burn Mechanism</strong>: Portion of fees periodically burned<br />
      • <strong>Community Allocation</strong>: No team tokens — 100% community-owned from day one<br /><br />
      These tokenomics prioritize utility through gaming rewards, staking, and airdrops. $GROKGAME is built to last.
    </p>
  </>
);

const HowToBuySection = () => (
  <>
    <h2 className="text-3xl font-bold text-white mb-6">How to Buy $GROKGAME</h2>
    <p className="text-gray-300 text-lg leading-relaxed">
      Ready to join the $GROKGAME revolution? Buying is quick and easy through PumpFun on Solana.<br /><br />
      1. Set Up a Solana Wallet (Phantom, Solflare, Backpack)<br />
      2. Fund it with SOL<br />
      3. Go to pump.fun<br />
      4. Paste CA: 5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump<br />
      5. Swap → done!<br /><br />
      Welcome to the winning team. LFG ∞
    </p>
  </>
);

function LotterySection() {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 1ST</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: <Countdown targetDate="2025-12-01T00:00:00Z" /></p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Exciting news for $GROKGAME holders! The Lottery feature is on the horizon, allowing you to purchase tickets for just 0.05 SOL each. The transaction when buying the ticket automatically creates your entry, with your public wallet ID serving as the unique ticket identifier, securely logged for the draw. All proceeds will fuel a massive Jackpot, with draws initially held at the end of each month. As our community grows, we'll transition to bi-weekly draws and eventually weekly for even more thrills.<br /><br />
        We'll go live on pump.fun at the close of each period, where Grok will randomly select the winner(s) in a transparent process. Starting simple with one lucky winner, we'll evolve to a three-tier payout as jackpots swell: 1st place claiming 60%, 2nd place 30%, and 3rd place 10%.<br /><br />
        Feel free to buy as many tickets as you want to boost your chances!<br /><br />
        As a bonus, holders with over 10 million $GROKGAME tokens will receive one free entry per month. This threshold will adjust downward as our market cap climbs—for example, at a $100K MC, you might only need 7 million tokens to qualify. Stay tuned for this game-changing addition!
      </p>
    </>
  );
}

function SportsBettingSection() {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 1ST</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: <Countdown targetDate="2025-12-01T00:00:00Z" /></p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Get ready for major sports betting on $GROKGAME! Holders will soon be able to wager Solana and win big on select sporting events. We'll kick off with UFC PPV main events and other high-profile matchups, like World Series championship games, Stanley Cup finals, and more.<br /><br />
        Odds will be set at integration time based on Grok's real-time data for each event and locked until the start, when betting closes. Start small with a minimum bet of 0.1 SOL and up to a maximum of 1 SOL per wager. A flat 0.025 SOL fee per bet will support the treasury, ensuring smooth payouts even in challenging months for the house.<br /><br />
        As we expand, expect more sports, events, and higher max bets to keep the action going. Stay tuned—this is your chance to turn sports knowledge into real rewards!
      </p>
    </>
  );
}

function StakingSection() {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY DECEMBER 22ND</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: <Countdown targetDate="2025-12-22T00:00:00Z" /></p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Exciting passive earning opportunities are coming to $GROKGAME! Holders will be able to stake their tokens in a secure, Solana-based pool to earn rewards, powered by a portion of platform fees from mini-games, lottery ticket sales, and sports betting. This creates a self-sustaining ecosystem where community activity directly benefits stakers—perfect utility for those who prefer passive growth over the active betting features.<br /><br />
        Rewards will be distributed in $GROKGAME (with potential SOL bonuses for top tiers), based on your staked amount and duration. Expect competitive APYs starting around 10-20% (adjusted dynamically based on treasury health and participation to ensure fairness—no fixed promises, as yields will vary with platform revenue). Longer lock-up periods (e.g., 30/60/90 days) unlock bonus multipliers for extra incentives.<br /><br />
        To keep things fair and sustainable:<br />
        • Minimum stake: 1 million $GROKGAME.<br />
        • No maximum, but tiered perks for larger holders (e.g., exclusive airdrops or early access).<br />
        • A small 2-5% protocol fee on rewards or unstaking will support the house treasury—funding burns, marketing, and further development.<br /><br />
        Unstaking is flexible after the lock-up, with instant options for a higher fee if needed. All staking will be transparent, with on-chain tracking and regular audits planned. This isn't just holding—it's earning while building the future of $GROKGAME. Get ready to lock in and level up!
      </p>
    </>
  );
}

function PvPSection() {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - BY JANUARY 5TH</h2>
      <p className="text-cyan-400 font-bold mb-4">Countdown to Launch: <Countdown targetDate="2026-01-05T00:00:00Z" /></p>
      <p className="text-gray-300 text-lg leading-relaxed">
        Gear up for intense competition with PvP Mode on $GROKGAME! By January 5th, we'll roll out our first PvP game, where holders can enter matchmaking to challenge others, stake their tokens, and battle it out—winner takes all. Perfect for competitive spirits who thrive on head-to-head action!<br /><br />
        We'll quickly expand with four additional games in the PvP section within a week or two of launch. Plus, as our user interface evolves to include friends lists and more, you'll be able to send direct challenge requests for personalized showdowns.<br /><br />
        The house stays sustainable with a modest 0.015 SOL transaction fee on both ends of each match. Get ready to test your skills and claim victory—PvP Mode is where legends are made!
      </p>
    </>
  );
}

function GrokGameSection() {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">COMING SOON - MID-LATE 2026</h2>
      <p className="text-gray-300 text-lg leading-relaxed">
        The ultimate vision and crown jewel of our project is GrokGame—a massive multiplayer online role-playing game (MMORPG) inspired by RuneScape, but with its own unique twist. Players will roam vast open worlds, level up skills, embark on quests, and compete against one another in epic battles and collaborations.<br /><br />
        $GROKGAME holders will gain exclusive access to play, with tiered benefits based on your holdings and duration—think special in-game items, boosted XP rates, and premium features. Early adopters will be rewarded handsomely with unique incentives and rare rewards to kickstart their adventures.<br /><br />
        More specific details, including gameplay mechanics and additional holder perks, will roll out as development begins. Squid and Grok are thrilled about this milestone—it's where the true magic of $GROKGAME comes to life!
      </p>
    </>
  );
}

/* ====================== MAIN PAGE ====================== */
export default function Home() {
  const { publicKey } = useWallet();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [wins, setWins] = useState<Array<{name: string; amount: string; game: string}>>([]);

  const leaderboard = [
    { name: 'SquidKing', win: '312,500' },
    { name: 'GrokGod', win: '250,000' },
    { name: 'Anon420', win: '187,500' },
  ];

  useEffect(() => {
    // @ts-ignore
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

  const handleWin = async (amount: string, game: string) => {
    const win = { name: username || publicKey?.toBase58().slice(0, 6) || 'Anon', amount, game };
    setWins([win, ...wins.slice(0, 4)]);
  };

  const shareWin = (win: any) => {
    const text = `I just won ${win.amount} $GROKGAME on ${win.game} at https://grok-game-gamma.vercel.app! LFG ∞`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
    setActiveGame(null);
    setShowDropdown(false);
    setShowGamesDropdown(false);
  };

  const ca = '5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump';

  const handleCopy = () => {
    navigator.clipboard.writeText(ca);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="fixed top-4 right-4 z-50">
            <WalletMultiButton style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }} />
          </div>

          {/* PERFECT SMALL BANNER */}
          <header className="bg-black py-4 border-8 border-purple-600 shadow-2xl shadow-purple-600/60 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none shadow-[0_0_60px_#c084fc] opacity-50"></div>
            <div className="absolute inset-0 pointer-events-none shadow-[0_0_30px_#ec4899] opacity-30"></div>

            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 leading-none">
                  $GROKGAME
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 mt-1 font-medium tracking-wider">
                  Real games. Real wins. Real utility.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => window.open('https://x.com/Grok_Game_Sol', '_blank')} className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold w-6 h-6 rounded-full text-lg shadow-xl flex items-center justify-center hover:scale-110 transition-all">
                    X
                  </button>
                  <button onClick={() => window.open('https://github.com/0x-SquidSol/GrokGame', '_blank')} className="bg-gray-800 hover:bg-gray-700 text-white w-6 h-6 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mr-8">
                <Image src="/logo.png" alt="$GROKGAME" width={80} height={80} className="rounded-full shadow-2xl border-4 border-purple-500/80 ring-4 ring-purple-600/40" />
                <button onClick={() => window.open(PUMP_FUN_LINK, '_blank')} className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold py-2 px-6 rounded-full text-lg hover:scale-105 transition-all shadow-2xl">
                  BUY $GROKGAME
                </button>
              </div>
            </div>
          </header>

          {/* BUTTONS ROW */}
          <div className="flex justify-start px-6 mt-8 gap-4 flex-wrap">
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">
                Project Info
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 bg-black/80 border border-purple-600 rounded-xl p-4 shadow-2xl w-48 z-10">
                  <button onClick={() => toggleSection('introduction')} className="block w-full text-left text-gray-300 hover:text-white py-2">1. Introduction</button>
                  <button onClick={() => toggleSection('roadmap')} className="block w-full text-left text-gray-300 hover:text-white py-2">2. Project Roadmap</button>
                  <button onClick={() => toggleSection('tokenomics')} className="block w-full text-left text-gray-300 hover:text-white py-2">3. Tokenomics</button>
                  <button onClick={() => toggleSection('howToBuy')} className="block w-full text-left text-gray-300 hover:text-white py-2">4. How to Buy</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowGamesDropdown(!showGamesDropdown)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">
                Mini-Games
              </button>
              {showGamesDropdown && (
                <div className="absolute left-0 mt-2 bg-black/80 border border-purple-600 rounded-xl p-4 shadow-2xl w-48 z-10">
                  <button onClick={() => { setActiveGame('doors'); setShowGamesDropdown(false); setActiveSection(null); }} className="block w-full text-left text-gray-300 hover:text-white py-2">Doors Game</button>
                  <button onClick={() => { setActiveGame('mines'); setShowGamesDropdown(false); setActiveSection(null); }} className="block w/full text-left text-gray-300 hover:text-white py-2">Mines Game</button>
                  <button onClick={() => { setActiveGame('plinko'); setShowGamesDropdown(false); setActiveSection(null); }} className="block w/full text-left text-gray-300 hover:text-white py-2">Plinko</button>
                <button onClick={() => { setActiveGame('blackjack'); setShowGamesDropdown(false); setActiveSection(null); }} className="block w-full text-left text-gray-300 hover:text-white py-2">
  Blackjack
</button>
                </div>
              )}
            </div>

            <button onClick={() => toggleSection('lottery')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">Lottery</button>
            <button onClick={() => toggleSection('sportsBetting')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">Sports Betting</button>
            <button onClick={() => toggleSection('staking')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">Staking</button>
            <button onClick={() => toggleSection('pvp')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">PvP Mode</button>
            <button onClick={() => toggleSection('grokgame')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all">GrokGame</button>
          </div>

          {/* CENTRAL CONTENT AREA */}
          <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mt-6 max-w-4xl w-full mx-auto shadow-2xl border border-purple-600 min-h-[700px] flex flex-col">
            {activeSection ? (
              <>
                {activeSection === 'introduction' && <IntroductionSection />}
                {activeSection === 'roadmap' && <RoadmapSection />}
                {activeSection === 'tokenomics' && <TokenomicsSection />}
                {activeSection === 'howToBuy' && <HowToBuySection />}
                {activeSection === 'lottery' && <LotterySection />}
                {activeSection === 'sportsBetting' && <SportsBettingSection />}
                {activeSection === 'staking' && <StakingSection />}
                {activeSection === 'pvp' && <PvPSection />}
                {activeSection === 'grokgame' && <GrokGameSection />}
              </>
            ) : activeGame ? (
              <>
                {activeGame === 'doors' && <DoorsGame onWin={handleWin} />}
                {activeGame === 'mines' && <MinesGame onWin={handleWin} />}
                {activeGame === 'plinko' && <PlinkoGame onWin={handleWin} />}
                {activeGame === 'blackjack' && <BlackjackGame onWin={handleWin} />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 pt-10">
                <Image
                  src="/grokcharacter.png"
                  alt="$GROKGAME - Grok Awakens"
                  width={650}
                  height={900}
                  className="max-w-full h-auto rounded-2xl shadow-2xl shadow-cyan-500/60"
                  priority
                />
                <div className="mt-12 text-center">
                  <button
                    onClick={handleCopy}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-5 px-20 rounded-full text-2xl shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse"
                  >
                    {copied ? 'Copied!' : 'Tap to Copy CA'}
                  </button>
                  <p className="mt-6 text-gray-400 font-mono text-sm tracking-wider break-all px-4">
                    5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Win ticker & leaderboard */}
          {wins.length > 0 && (
            <div className="mt-8 bg-black/80 rounded-xl p-4 overflow-hidden shadow-xl max-w-4xl mx-auto">
              <div className="animate-marquee whitespace-nowrap">
                {wins.concat(wins).map((w, i) => (
                  <span key={i} className="mx-8 text-green-400 font-bold inline-block">
                    {w.name} won {w.amount} on {w.game}!{' '}
                    <button onClick={() => shareWin(w)} className="ml-2 text-cyan-400 underline hover:text-cyan-300">Share</button>
                  </span>
                ))}
              </div>
            </div>
          )}

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
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}