'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from '@solana/spl-token';
import { useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET = 25000;
const PAYOUTS = [0, 1.5, 2.0, 3.0, 5.0, 10.0]; // 0-5 safe tiles
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');

export default function MinesGame() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [grid, setGrid] = useState(Array(25).fill('?'));
  const [bombs, setBombs] = useState([]);
  const [safeCount, setSafeCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');

  const rpcConnection = new Connection('https://solana-mainnet.rpc.extrnode.com/d0a0d1a9-566d-4757-b253-640db382b82e', 'confirmed');

  const start = async () => {
    console.log('Start button clicked – initiating tx');
    if (!publicKey) return alert('Connect wallet');
    
    setResult('Preparing bet...');
    try {
      console.log('Entering try block – preparing tx');
      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const ix = createTransferCheckedInstruction(
        userTokenAccount,
        TOKEN_MINT,
        treasuryTokenAccount,
        publicKey,
        BET * (10 ** DECIMALS),
        DECIMALS
      );

      const tx = new Transaction().add(ix);
      console.log('Sending transaction');
      const sig = await sendTransaction(tx, rpcConnection);
      await rpcConnection.confirmTransaction(sig, 'confirmed');

      setResult('Bet placed! Start picking tiles.');
      setPlaying(true); setGameOver(false); setSafeCount(0);
      setGrid(Array(25).fill('?'));
      
      // Provably fair bombs using blockhash
      const txInfo = await rpcConnection.getTransaction(sig, { commitment: 'confirmed' });
      const hash = txInfo?.transaction.message.recentBlockhash || '';
      console.log('Random Blockhash:', hash); // Fresh every play
      const bombIndices = [];
      for (let i = 0; bombIndices.length < 3; i++) {
        const index = parseInt(hash.slice(i*2, i*2+2), 16) % 25;
        if (!bombIndices.includes(index)) bombIndices.push(index);
      }
      setBombs(bombIndices);
      console.log('Bombs positions:', bombIndices); // Confirm different every play
    } catch (e) {
      console.log('Error in start:', e);
      alert('Transaction failed: ' + e.message);
      setResult('');
      setPlaying(false);
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
      setResult('🔴 BOMB! Lost.');
    } else {
      newGrid[i] = '💎';
      setGrid(newGrid);
      const newCount = safeCount + 1;
      setSafeCount(newCount);
      setResult(`💎 Safe! ${newCount} gems - Potential win: ${(BET * PAYOUTS[newCount]).toLocaleString()} (${PAYOUTS[newCount]}x)`);
      if (newCount === 5) {
        setGameOver(true);
        setPlaying(false);
        const win = BET * PAYOUTS[newCount];
        setResult(`🎉 MAX WIN! ${win.toLocaleString()} $GROKGAME`);
        console.log('WINNER LOG:', {
          username: localStorage.getItem('grok_username') || 'Anon',
          publicKey: publicKey.toBase58(),
          amount: win,
          game: 'Mines',
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-4">MINES</h2>
      <p className="text-xl text-green-400 mb-6">Find 5 gems → win up to 10x!</p>
      {result && <p className="text-2xl mb-6 font-bold">{result}</p>}
      <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto mb-6">
        {grid.map((cell, i) => (
          <button key={i} onClick={() => pick(i)} disabled={!playing || gameOver} className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 w-12 h-12 text-2xl rounded font-bold">
            {cell}
          </button>
        ))}
      </div>
      <button onClick={start} disabled={playing} className="bg-purple-600 hover:bg-purple-700 px-12 py-4 text-xl rounded font-bold">
        BET 25K
      </button>
    </div>
  );
}