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
const PAYOUTS = [0, 2, 5, 8, 13, 18];  // Adjusted to match requested amounts: 2x=50k, 5x=125k, 8x=200k, 13x=325k, 18x=450k (index 1-5 for gems found)

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
  const [showCashOut, setShowCashOut] = useState(false);  // New state for cash out prompt

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

      tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);

      const bombIndices = [];
      let i = 0;
      while (bombIndices.length < 20 && i < 100) {
        const byte = parseInt(sig.slice(i * 2, (i * 2) + 2) || '0', 16);
        const index = byte % 25;
        if (!bombIndices.includes(index)) bombIndices.push(index);
        i++;
      }

      setBombs(bombIndices);
      setPlaying(true);
      setGameOver(false);
      setSafeCount(0);
      setGrid(Array(25).fill('?'));
      setResult('Bet placed! Find the 5 gems...');
      setLoading(false);
      setShowCashOut(false);

      setTimeout(updateBalance, 1000);

    } catch (e) {
      console.error(e);
      alert('Transaction failed or rejected');
      setResult('');
      setLoading(false);
    }
  };

  const pick = (i) => {
    if (!playing || gameOver || grid[i] !== '?' || showCashOut) return;

    const newGrid = [...grid];
    if (bombs.includes(i)) {
      newGrid[i] = 'Bomb';
      setGrid(newGrid);
      setGameOver(true);
      setPlaying(false);
      setResult('Bomb! You lost.');
    } else {
      newGrid[i] = 'Gem';
      setGrid(newGrid);
      const newCount = safeCount + 1;
      setSafeCount(newCount);
      const payout = PAYOUTS[newCount];
      const winAmount = Number(BET_AMOUNT * BigInt(payout)) / 10 ** DECIMALS;

      setResult(`Gem! ${newCount}/5 — Cash out for ${winAmount.toLocaleString()} (${payout}x) or continue?`);
      setShowCashOut(true);  // Show cash out prompt after each gem

      if (newCount === 5) {
        setShowCashOut(false);
        setGameOver(true);
        setPlaying(false);
        setResult(`JACKPOT! 18× WIN! ${winAmount.toLocaleString()} $GROKGAME`);
        onWin?.(winAmount.toString(), 'Mines');
      }
    }
  };

  const cashOut = () => {
    const payout = PAYOUTS[safeCount];
    const winAmount = Number(BET_AMOUNT * BigInt(payout)) / 10 ** DECIMALS;
    setResult(`Cashed out! WIN ${payout}x → ${winAmount.toLocaleString()} $GROKGAME`);
    onWin?.(winAmount.toString(), 'Mines');
    setGameOver(true);
    setPlaying(false);
    setShowCashOut(false);
  };

  const continueGame = () => {
    setShowCashOut(false);
    const payout = PAYOUTS[safeCount];
    const winAmount = Number(BET_AMOUNT * BigInt(payout)) / 10 ** DECIMALS;
    setResult(`Gem! ${safeCount}/5 — Potential next: ${winAmount.toLocaleString()} (${payout}x)`);
  };

  const reset = () => {
    setGrid(Array(25).fill('?'));
    setBombs([]);
    setResult('');
    setGameOver(false);
    setPlaying(false);
    setSafeCount(0);
    setShowCashOut(false);
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">MINES</h1>
      <p className="mb-2 text-gray-300">20 bombs • 5 gems • up to 18×</p>
      <p className="mb-6 text-sm text-gray-400">
        Balance: {(Number(balance) / 1e6).toFixed(0).toLocaleString()} $GROKGAME
      </p>

      {result && <div className="mb-8 p-5 bg-black/70 rounded-2xl text-xl font-bold">{result}</div>}

      {!playing && !gameOver && (
        <button
          onClick={start}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-5 px-16 rounded-full text-3xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? 'Placing bet...' : 'BET 25K'}
        </button>
      )}

      <div className="grid grid-cols-5 gap-4 mt-10 max-w-lg mx-auto">
        {grid.map((cell, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={!playing || gameOver || cell !== '?' || showCashOut}
            className={`aspect-square text-6xl font-bold rounded-2xl transition-all duration-300 shadow-2xl border-4 border-zinc-800
              ${cell === '?' ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 hover:scale-110 cursor-pointer' : ''}
              ${cell === 'Bomb' ? 'bg-gradient-to-br from-red-600 to-red-900 scale-125 animate-pulse' : ''}
              ${cell === 'Gem' ? 'bg-gradient-to-br from-emerald-500 to-green-600 scale-110' : ''}
            `}
          >
            {cell === 'Bomb' ? 'Bomb' : cell === 'Gem' ? 'Gem' : '?'}
          </button>
        ))}
      </div>

      {showCashOut && (
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={cashOut}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-xl transition shadow-xl"
          >
            Cash Out
          </button>
          <button
            onClick={continueGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl transition shadow-xl"
          >
            Continue
          </button>
        </div>
      )}

      {(gameOver || !playing) && (
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