'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction, getAccount } from '@solana/spl-token';
import { useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET_AMOUNT = 25000n; // Use BigInt for precision
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const PAYOUTS = [0, 1.5, 2.0, 3.0, 5.0, 10.0]; // 0-5 safe tiles

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

  // Fetch balance on mount/load
  const updateBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      try {
        const account = await getAccount(connection, ata);
        setBalance(BigInt(account.amount));
      } catch (e) {
        if (e.name === 'TokenAccountNotFoundError') {
          setBalance(0n);
          alert('Create ATA for $GROKGAME in your wallet first.');
        } else throw e;
      }
    } catch (e) {
      console.error('Balance fetch error:', e);
      setBalance(0n);
    }
  };

  const start = async () => {
    if (!publicKey) return alert('Connect wallet');
    if (balance < BET_AMOUNT) return alert(`Insufficient balance. Need ${BET_AMOUNT / BigInt(10 ** DECIMALS)} tokens.`);

    setLoading(true);
    setResult('Preparing bet...');
    try {
      console.log('Preparing tx...');
      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const ix = createTransferCheckedInstruction(
        userTokenAccount,
        TOKEN_MINT,
        treasuryTokenAccount,
        publicKey,
        BET_AMOUNT,
        DECIMALS
      );

      const tx = new Transaction().add(ix);
      console.log('Sending tx...');
      const sig = await sendTransaction(tx, connection); // Use shared connection!
      console.log('Sig:', sig);

      // Modern confirm (use shared connection)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      setResult('Bet placed! Start picking tiles.');
      setPlaying(true);
      setGameOver(false);
      setSafeCount(0);
      await updateBalance(); // Refresh balance

      // Provably fair: Use tx blockhash (via shared connection)
      const txInfo = await connection.getTransaction(sig, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      const hash = txInfo?.transaction?.message?.recentBlockhash || '';
      console.log('Blockhash for fair:', hash);

      const bombIndices = [];
      for (let i = 0; bombIndices.length < 3; i++) {
        const index = parseInt(hash.slice(i * 2, (i * 2) + 2), 16) % 25;
        if (!bombIndices.includes(index)) bombIndices.push(index);
      }
      setBombs(bombIndices);
      console.log('Bombs:', bombIndices);
    } catch (e) {
      console.error('Tx error:', e);
      alert(`Transaction failed: ${e.message || e.toString()}`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const pick = (i) => {
    if (!playing || gameOver || grid[i] !== '?') return;
    const newGrid = [...grid];
    if (bombs.includes(i)) {
      newGrid[i] = '💣';
      setGrid(newGrid);
      setGameOver(true);
      setPlaying(false);
      setResult('💥 BOMB! You lost.');
    } else {
      newGrid[i] = '💎';
      setGrid(newGrid);
      const newCount = safeCount + 1;
      setSafeCount(newCount);
      const payout = PAYOUTS[newCount];
      setResult(`Safe! ${newCount}/5 gems - Potential: ${(BET_AMOUNT / BigInt(10 ** DECIMALS) * BigInt(payout * 10 ** DECIMALS)).toLocaleString()} (${payout}x)`);
      if (newCount === 5) {
        setGameOver(true);
        setPlaying(false);
        const winAmount = (BET_AMOUNT * BigInt(payout * 10 ** DECIMALS)).toString();
        setResult(`🎉 MAX WIN! ${winAmount} $GROKGAME`);
        onWin?.(winAmount, 'Mines'); // Notify parent
      }
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">MINES</h1>
      <p className="mb-4 text-gray-300">Find 5 gems → win up to 10x!</p>
      <p className="mb-4 text-sm text-gray-400">Balance: {(Number(balance) / 1e6).toLocaleString()}</p>
      {result && <p className="mb-4 p-3 bg-black/50 rounded-lg text-lg">{result}</p>}
      
      {/* BET BUTTON */}
      {!playing && !gameOver && (
        <button
          onClick={start}
          disabled={loading || balance < BET_AMOUNT}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-all shadow-xl disabled:opacity-50"
        >
          {loading ? 'Preparing...' : `BET 25K`}
        </button>
      )}

      {/* GRID */}
      <div className="grid grid-cols-5 gap-2 mt-8 max-w-md mx-auto">
        {grid.map((cell, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={!playing || gameOver || cell !== '?'}
            className={`w-16 h-16 text-2xl font-bold rounded-xl transition-all shadow-md ${
              cell === '?'
                ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:scale-110 cursor-pointer'
                : cell === '💣'
                ? 'bg-gradient-to-br from-red-600 to-red-800 scale-110'
                : 'bg-gradient-to-br from-emerald-500 to-green-600 scale-110'
            } ${!playing || gameOver || cell !== '?' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameOver && (
        <button
          onClick={() => {
            setResult('');
            setGameOver(false);
            updateBalance();
          }}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
        >
          Play Again
        </button>
      )}
    </div>
  );
}