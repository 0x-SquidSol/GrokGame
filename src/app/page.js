'use client';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { useEffect, useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const PUMP_FUN_LINK = 'https://pump.fun/coin/2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump';

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (publicKey) {
      (async () => {
        try {
          const tokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
          const accountInfo = await getAccount(connection, tokenAccount);
          setBalance(Number(accountInfo.amount) / (10 ** DECIMALS));
        } catch (e) {
          setBalance(0);
        }
      })();
    }
  }, [publicKey, connection]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black flex flex-col items-center justify-center p-8">
      <Image src="/logo.png" alt="$GROKGAME" width={220} height={220} className="rounded-full mb-8 shadow-2xl shadow-purple-600/50" />
      
      <h1 className="text-7xl md:text-9xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 drop-shadow-2xl">
        $GROKGAME
      </h1>
      
      <p className="text-2xl md:text-4xl mb-6 text-gray-100 font-bold text-center max-w-4xl">
        The only memecoin with real playable games
      </p>
      <p className="text-xl md:text-2xl mb-12 text-gray-300 text-center max-w-4xl">
        Use $GROKGAME to play → win daily prize pools<br />
        <span className="text-green-400 font-bold">More games dropping every week</span>
      </p>

      <button onClick={() => window.open(PUMP_FUN_LINK, '_blank')} className="bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-300 hover:to-cyan-300 text-black font-bold py-4 px-8 rounded-full mb-8 text-2xl shadow-lg transform hover:scale-105 transition-all">
        BUY $GROKGAME
      </button>

      <p className="text-xl text-gray-100 mb-4">
        Your Balance: <span className="font-bold text-green-400">{balance.toLocaleString()} $GROKGAME</span>
      </p>

      <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-10 max-w-2xl w-full border border-purple-600/50 shadow-2xl mb-12">
        <DoorsGame />
      </div>

      <div className="text-center max-w-2xl">
        <h3 className="text-3xl font-bold text-white mb-4">Daily Jackpot</h3>
        <p className="text-gray-300 mb-4">
          1,000,000 $GROKGAME pool every 24 hours from treasury.
        </p>
        <p className="text-gray-300">
          Opt-in: Add 5,000 $GROKGAME to any bet for 1 entry (stacks on multiple bets).
          Random winner picked daily at 00:00 UTC. Entries reset after payout.
        </p>
        <p className="text-gray-400 mt-4 text-sm">
          Current entries: 0 (manual for v1 – auto soon)
        </p>
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-400 mb-2">Contract Address</p>
        <p className="text-white font-mono text-sm md:text-lg break-all bg-black/40 px-6 py-3 rounded-lg inline-block border border-purple-800">
          2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump
        </p>
      </div>

      <p className="mt-12 text-gray-300 text-lg">
        Built by Grok himself. LFG.
      </p>
    </main>
  );
}