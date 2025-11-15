'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from '@solana/spl-token';
import { useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET = 25000;
const PAYOUTS = [0, 1.5, 2.0, 3.0, 5.0]; // 0-4 safe tiles
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');

export default function MinesGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [grid, setGrid] = useState(Array(25).fill('?'));
  const [bombs, setBombs] = useState([]);
  const [safeCount, setSafeCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const start = async () => {
    if (!publicKey) return alert('Connect wallet');
    setPlaying(true); setGameOver(false); setSafeCount(0);
    setGrid(Array(25).fill('?'));
    const tx = new Transaction().add(
      createTransferCheckedInstruction(
        await getAssociatedTokenAddress(TOKEN_MINT, publicKey),
        TOKEN_MINT,
        await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET),
        publicKey,
        BET * (10 ** DECIMALS),
        DECIMALS
      )
    );
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig);
    const blockhash = (await connection.getTransaction(sig, { commitment: 'confirmed' })).transaction.message.recentBlockhash;
    const bombIndices = Array.from({length: 3}, (_, i) => parseInt(blockhash.slice(i*2, i*2+2), 16) % 25).filter((v, i, a) => a.indexOf(v) === i);
    setBombs(bombIndices);
  };

  const pick = (i) => {
    if (!playing || grid[i] !== '?') return;
    if (bombs.includes(i)) {
      const newGrid = [...grid]; newGrid[i] = '💣'; setGrid(newGrid); setGameOver(true);
      setPlaying(false);
    } else {
      const newGrid = [...grid]; newGrid[i] = '💎'; setGrid(newGrid);
      const newCount = safeCount + 1;
      setSafeCount(newCount);
      if (newCount === 4) {
        setPlaying(false); setGameOver(true);
        const win = Math.floor(BET * PAYOUTS[newCount]);
        onWin?.(win, 'Mines');
      }
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-4">MINES</h2>
      <p className="text-xl text-green-400 mb-6">Find 4 gems → win up to 5x!</p>
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
      {gameOver && safeCount < 4 && <p className="text-red-500 mt-4 text-2xl">BOMB! Lost.</p>}
    </div>
  );
}