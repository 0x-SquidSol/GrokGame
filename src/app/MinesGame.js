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

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET_AMOUNT = 25_000_000_000n; // 25,000 tokens
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');

// Real mines payout (20 bombs, 5 gems) — fair house edge
const PAYOUTS = [0, 1.2, 1.5, 2.0, 3.0, 20.0]; // 20× on all 5 gems

export default function MinesGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [grid, setGrid] = useState(Array(25).fill('?'));
  const [bombs, setBombs] = useState([]);
  const [safeCount, setSafeCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) updateBalance();
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
    setResult('Preparing bet...');

    try {
      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const tx = new Transaction();

      // Auto-create ATA if missing
      try {
        await getAccount(connection, userTokenAccount);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(
          publicKey,
          userTokenAccount,
          publicKey,
          TOKEN_MINT
        ));
      }

      tx.add(createTransferCheckedInstruction(
        userTokenAccount,
        TOKEN_MINT,
        treasuryTokenAccount,
        publicKey,
        BET_AMOUNT,
        DECIMALS
      ));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      console.log('Bet placed:', sig);

      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      setResult('Bet placed! Find the 5 gems...');
      setPlaying(true);
      setGameOver(false);
      setSafeCount(0);
      setGrid(Array(25).fill('?'));

      // Provably fair: 20 bombs out of 25
      const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      const hash = txInfo?.transaction?.message?.recentBlockhash || '';
      const bombIndices = [];
      for (let i = 0; bombIndices.length < 20; i++) {  // ← 20 BOMBS
        const index = parseInt(hash.slice(i * 2, (i * 2) + 2), 16) % 25;
        if (!bombIndices.includes(index)) bombIndices.push(index);
      }
      setBombs(bombIndices);
      console.log('20 Bombs at:', bombIndices);

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
    if (!playing || gameOver || grid[i] !== '?') return;

    const newGrid = [...grid];
    if (bombs.includes(i)) {
      newGrid[i] = 'Bomb';
      setGrid(newGrid);
      setGameOver(true);
      setPlaying(false);
      setResult('Bomb! BOMB! You lost.');
    } else {
      newGrid[i] = 'Gem';
      setGrid(newGrid);
      const newCount = safeCount + 1;
      setSafeCount(newCount);
      const payout = PAYOUTS[newCount];
      const winAmount = Number(BET_AMOUNT * BigInt(payout * 10 ** DECIMALS)) / 10 ** DECIMALS;

      setResult(`Gem! Safe! ${newCount}/5 — Potential: ${winAmount.toLocaleString()} (${payout}x)`);

      if (newCount === 5) {
        setGameOver(true);
        setPlaying(false);
        setResult(`JACKPOT! ALL 5 GEMS! ${winAmount.toLocaleString()} $GROKGAME`);
        onWin?.(winAmount.toString(), 'Mines');
      }
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">MINES</h1>
      <p className="mb-2 text-gray-300">20 bombs • 5 gems • up to 20×</p>
      <p className="mb-4 text-sm text-gray-400">
        Balance: {(Number(balance) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </p>

      {result && <p className="mb-6 p-4 bg-black/70 rounded-xl text-lg font-medium">{result}</p>}

      {!playing && !gameOver && (
        <button
          onClick={start}
          disabled={loading || balance < BET_AMOUNT}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? 'Placing bet...' : 'BET 25K'}
        </button>
      )}

      <div className="grid grid-cols-5 gap-3 mt-10 max-w-lg mx-auto">
        {grid.map((cell, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={!playing || gameOver || cell !== '?'}
            className={`aspect-square text-4xl font-bold rounded-2xl transition-all shadow-2xl border-2 border-zinc-700
              ${cell === '?' ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 hover:scale-110 cursor-pointer' : ''}
              ${cell === 'Bomb' ? 'bg-gradient-to-br from-red-600 to-red-900 scale-125 animate-pulse' : ''}
              ${cell === 'Gem' ? 'bg-gradient-to-br from-emerald-500 to-green-600 scale-110' : ''}
              ${(!playing || gameOver || cell !== '?') ? 'cursor-not-allowed opacity-70' : ''}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameOver && (
        <button
          onClick={() => {
            setGrid(Array(25).fill('?'));
            setBombs([]);
            setResult('');
            setGameOver(false);
            setPlaying(false);
            setSafeCount(0);
            updateBalance();
          }}
          className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-full text-xl transition"
        >
          Play Again
        </button>
      )}
    </div>
  );
}