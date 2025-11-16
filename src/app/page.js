'use client';
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import DoorsGame from './DoorsGame';
import MinesGame from './MinesGame';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

const PUMP_FUN_LINK = 'https://pump.fun/2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump';

export default function Home() {
  const { publicKey } = useWallet();
  const [activeGame, setActiveGame] = useState('doors');
  const [username, setUsername] = useState('');
  const [wins, setWins] = useState([]);
  const [leaderboard] = useState([
    { name: 'SquidKing', win: '312,500' },
    { name: 'GrokGod', win: '250,000' },
    { name: 'Anon420', win: '187,500' },
  ]);

  useEffect(() => {
    if (publicKey && !username) {
      const saved = localStorage.getItem('grok_username');
      if (saved) setUsername(saved);
      else {
        const name = prompt('Enter your username for leaderboard:');
        if (name) { setUsername(name); localStorage.setItem('grok_username', name); }
      }
    }
  }, [publicKey]);

  const handleWin = (amount, game) => {
    const win = { name: username || publicKey.toBase58().slice(0, 6), amount, game };
    setWins([win, ...wins.slice(0, 4)]);
  };

  const shareWin = (win) => {
    const text = `I just won ${win.amount} $GROKGAME on ${win.game} at https://grok-game-gamma.vercel.app! LFG ♾️`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black p-4 md:p-8">
      <Image src="/logo.png" alt="$GROKGAME" width={180} height={180} className="rounded-full mb-6 shadow-2xl" />
      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400">$GROKGAME</h1>
      <p className="text-lg md:text-2xl text-gray-300 mt-4">Real games. Real wins. Real utility.</p>

      <button onClick={() => window.open(PUMP_FUN_LINK, '_blank')} className="mt-6 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold py-3 px-8 rounded-full text-xl hover:scale-105 transition">
        BUY $GROKGAME
      </button>
<button onClick={() => window.open('https://x.com/Grok_Game_Sol', '_blank')} className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full mb-8 text-2xl shadow-lg transform hover:scale-105 transition-all ml-4">
  X
</button>

      {/* Game Tabs */}
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={() => setActiveGame('doors')} className={`px-8 py-3 rounded-full font-bold text-lg ${activeGame === 'doors' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          🚪 Doors
        </button>
        <button onClick={() => setActiveGame('mines')} className={`px-8 py-3 rounded-full font-bold text-lg ${activeGame === 'mines' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          💎 Mines
        </button>
      </div>

      {/* Active Game */}
      <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mt-6 max-w-2xl w-full mx-auto">
        {activeGame === 'doors' ? <DoorsGame onWin={handleWin} /> : <MinesGame onWin={handleWin} />}
      </div>

      {/* Win Ticker */}
      {wins.length > 0 && (
        <div className="mt-8 bg-black/80 rounded-xl p-4 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {wins.concat(wins).map((w, i) => (
              <span key={i} className="mx-8 text-green-400 font-bold">
                🎉 {w.name} won {w.amount} on {w.game}! 
                <button onClick={() => shareWin(w)} className="ml-2 text-cyan-400 underline">Share</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mt-8 bg-black/60 rounded-3xl p-6 max-w-md w-full mx-auto">
        <h3 className="text-2xl font-bold text-white mb-4">🏆 Leaderboard</h3>
        {leaderboard.map((l, i) => (
          <div key={i} className="flex justify-between text-lg mb-2">
            <span className="text-gray-300">{i+1}. {l.name}</span>
            <span className="text-green-400 font-bold">{l.win}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-gray-400 text-sm">More games weekly. Jackpot. Burn. LFG.</p>
    </main>
  );
}