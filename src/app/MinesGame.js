'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,   // ← added this
} from '@solana/spl-token';
import { useState, useEffect } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET_AMOUNT = 25000n;
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const PAYOUTS = [0, 1.5, 2.0, 3.0, 5.0, 10.0];

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
    updateBalance();
  }, [publicKey]);

  const updateBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const account = await getAccount(connection, ata);
      setBalance(BigInt(account.amount));
    } catch (e) {
      setBalance(0n); // ATA doesn't exist yet → balance 0 is fine
    }
  };

  const start = async () => {
    if (!publicKey) return alert('Connect wallet');

    setLoading(true);
    setResult('Preparing bet...');

    try {
      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const tx = new Transaction();

      // Auto-create player ATA if it doesn't exist
      try {
        await getAccount(connection, userTokenAccount);
      } catch (e) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,           // payer
            userTokenAccount,        // ATA to create
            publicKey,           // owner
            TOKEN_MINT
          )
        );
      }

      // Add the bet transfer
      tx.add(
        createTransferCheckedInstruction(
          userTokenAccount,
          TOKEN_MINT,
          treasuryTokenAccount,
          publicKey,
          BET_AMOUNT,
          DECIMALS
        )
      );

      // Send transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      console.log('Transaction signature:', sig);

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      setResult('Bet placed! Start picking tiles.');
      setPlaying(true);
      setGameOver(false);
      setSafeCount(0);
      setGrid(Array(25).fill('?'));

      // Provably fair bomb placement
      const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      const hash = txInfo?.transaction?.message?.recentBlockhash || '';
      const bombIndices = [];
      for (let i = 0; bombIndices.length < 3; i++) {
        const index = parseInt(hash.slice(i * 2, (i * 2) + 2), 16) % 25;
        if (!bombIndices.includes(index)) bombIndices.push(index);
      }
      setBombs(bombIndices);

      await updateBalance();
    } catch (e) {
      console.error('Transaction error:', e);
      alert(`Transaction failed: ${e.message || e}`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  // rest of pick() and return JSX stays exactly the same as you had
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
      const winAmount = (BET_AMOUNT * BigInt(Math.floor(payout * 10 ** DECIMALS))) / BigInt(10 ** DECIMALS);
      setResult(`Safe! ${newCount}/5 gems - Potential: ${winAmount.toLocaleString()} (${payout}x)`);
      if (newCount === 5) {
        setGameOver(true);
        setPlaying(false);
        setResult(`🎉 MAX WIN! ${winAmount.toLocaleString()} $GROKGAME`);
        onWin?.(winAmount.toString(), 'Mines');
      }
    }
  };

  return (
    // ... your existing return JSX exactly as you had it
    // (BET button, grid, Play Again button, etc.)
  );
}