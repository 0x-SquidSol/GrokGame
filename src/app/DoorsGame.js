'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { useState, useEffect } from 'react';

const TOKEN_MINT = new PublicKey('5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump');
const DECIMALS = 6;
const BET_AMOUNT = 25_000_000_000n;
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const PAYOUT = 3n;

export default function DoorsGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [doors, setDoors] = useState(['?', '?', '?']);
  const [winningDoor, setWinningDoor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateBalance();
  }, [publicKey]);

  const updateBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const account = await getAccount(connection, ata);
      setBalance(BigInt(account.amount));
    } catch {
      setBalance(0n);
    }
  };

  const start = async () => {
    if (!publicKey) return alert('Connect wallet');
    if (balance < BET_AMOUNT) return alert('Not enough $GROKGAME');

    setLoading(true);
    setResult('Placing bet...');

    try {
      const userATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);
      const tx = new Transaction();

      try { await getAccount(connection, userATA); }
      catch { tx.add(createAssociatedTokenAccountInstruction(publicKey, userATA, publicKey, TOKEN_MINT)); }

      tx.add(createTransferCheckedInstruction(
        userATA, TOKEN_MINT, treasuryATA, publicKey, BET_AMOUNT, DECIMALS
      ));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

      const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      const hash = txInfo?.transaction?.message?.recentBlockhash || '';
      const winner = parseInt(hash.slice(-2), 16) % 3;

      setWinningDoor(winner);
      setDoors(['?', '?', '?']);
      setSelected(null);
      setResult('Bet placed! Pick a door →');
      await updateBalance();
    } catch (e) {
      console.error(e);
      alert('Transaction failed: ' + (e.message || e));
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const pick = (i) => {
    if (loading || selected !== null || winningDoor === null) return;

    setSelected(i);

    // Reveal all doors with proper emojis (ensures one winner always)
    const revealed = [0, 1, 2].map(idx => idx === winningDoor ? '🏆' : '💣');
    setDoors(revealed);

    if (i === winningDoor) {
      const winAmount = (BET_AMOUNT * PAYOUT);
      setResult(`WIN! +75,000 $GROKGAME`);
      onWin?.(winAmount.toString(), 'Doors');
    } else {
      setResult('LOSE! Try again.');
    }
  };

  const reset = () => {
    setDoors(['?', '?', '?']);
    setSelected(null);
    setWinningDoor(null);
    setResult('');
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">DOORS</h1>
      <p className="mb-2 text-gray-300">Pick a door → 1 in 3 chance for 3×!</p>
      <p className="mb-6 text-sm text-gray-400">
        Balance: {(Number(balance) / 1e6).toFixed(0).toLocaleString()} $GROKGAME
      </p>

      {result && (
        <div className="mb-8 p-5 bg-black/70 rounded-2xl text-2xl font-bold">
          {result}
        </div>
      )}

      {/* BET BUTTON */}
      {winningDoor === null && (
        <button
          onClick={start}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-5 px-16 rounded-full text-3xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? 'Placing bet...' : 'BET 25K'}
        </button>
      )}

      {/* DOORS */}
      <div className="flex justify-center gap-10 mt-12">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={loading || selected !== null || winningDoor === null}
            className={`relative w-36 h-64 rounded-3xl transition-all duration-500 shadow-2xl border-4 border-zinc-800
              ${selected === null 
                ? 'bg-gradient-to-b from-gray-800 to-gray-900 hover:scale-105 cursor-pointer' 
                : selected === i && doors[i] === '🏆'
                  ? 'bg-gradient-to-b from-yellow-400 to-amber-600 scale-125 animate-pulse'
                  : selected === i && doors[i] === '💣'
                    ? 'bg-gradient-to-b from-red-600 to-red-900 scale-125'
                    : doors[i] === '🏆'
                      ? 'bg-gradient-to-b from-emerald-500 to-green-600'
                      : 'bg-gradient-to-b from-gray-700 to-gray-800'
              }`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-6xl"> {/* Reduced from text-8xl to text-6xl to prevent overlap */}
              {selected === null ? '?' : doors[i]}
            </div>
          </button>
        ))}
      </div>

      {/* PLAY AGAIN */}
      {selected !== null && (
        <button
          onClick={reset}
          className="mt-12 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-12 rounded-full text-2xl transition shadow-xl"
        >
          Play Again
        </button>
      )}
    </div>
  );
}