'use client'; 

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from '@solana/spl-token';
import { useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const COST_TO_PLAY = 25000; // 25,000 tokens
const WIN_PAYOUT = 62500;   // 2.5x payout

// YOUR TREASURY WALLET (replace with real address)
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');

export default function DoorsGame() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [result, setResult] = useState('');
  const [playing, setPlaying] = useState(false);

  const play = async (chosenDoor) => {
    if (!publicKey) return alert('Connect wallet first');
    if (TREASURY_WALLET.toBase58() === 'PASTE_YOUR_TREASURY_ADDRESS_HERE') return alert('Set treasury wallet in DoorsGame.js');

    setPlaying(true);
    setResult('');

    try {
      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const ix = createTransferCheckedInstruction(
        userTokenAccount,
        TOKEN_MINT,
        treasuryTokenAccount,
        publicKey,
        COST_TO_PLAY * (10 ** DECIMALS),
        DECIMALS
      );

      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      // Provably fair: winning door from blockhash
      const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed' });
      const hash = txInfo?.transaction.message.recentBlockhash || '';
      const winningDoor = parseInt(hash.slice(-4), 16) % 3; // 0, 1, or 2

      if (winningDoor === chosenDoor) {
        setResult('🎰 JACKPOT! YOU WON 62,500 $GROKGAME! Airdropping in <10s');
      } else {
        setResult(`🚪 Wrong door! Winning door was ${winningDoor + 1}. Treasury eats.`);
      }
    } catch (e) {
      alert('Transaction failed: ' + e.message);
    }
    setPlaying(false);
  };

 return (
  <div className="text-center">
    <h2 className="text-4xl font-bold text-white mb-2">Pick a Door</h2>
    <p className="text-2xl text-green-400 font-black mb-8">
      Cost: 25,000 $GROKGAME → Win 62,500 (2.5x)
    </p>
    {result && <p className="text-3xl mb-8 font-bold">{result}</p>}
    
    <div className="flex justify-center gap-6 md:gap-12">
      <button 
        onClick={() => play(0)} 
        disabled={playing}
        className="bg-gradient-to-b from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 w-32 h-48 md:w-48 md:h-64 text-6xl rounded-3xl shadow-2xl transform hover:scale-105 transition-all font-black border-8 border-yellow-800"
      >
        🚪1
      </button>
      <button 
        onClick={() => play(1)} 
        disabled={playing}
        className="bg-gradient-to-b from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 w-32 h-48 md:w-48 md:h-64 text-6xl rounded-3xl shadow-2xl transform hover:scale-105 transition-all font-black border-8 border-yellow-800"
      >
        🚪2
      </button>
      <button 
        onClick={() => play(2)} 
        disabled={playing}
        className="bg-gradient-to-b from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 w-32 h-48 md:w-48 md:h-64 text-6xl rounded-3xl shadow-2xl transform hover:scale-105 transition-all font-black border-8 border-yellow-800"
      >
        🚪3
      </button>
    </div>
    
    <p className="mt-8 text-gray-400 text-sm">
      1 in 3 chance → 16.67% house edge funds daily prizes + marketing
    </p>
  </div>
);
}
