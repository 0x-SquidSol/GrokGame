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
const BET_AMOUNT = 25_000_000_000n;
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const PAYOUT = 3n;

export default function DoorsGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [doors, setDoors] = useState(['?', '?', '?']);
  const [winningDoor, setWinningDoor] = useState(null); // ← NEW: store once
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
    if (balance < BET_AMOUNT) return alert('Not enough tokens');

    setLoading(true);
    setResult('Placing bet...');

    try {
      const userATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const tx = new Transaction();

      try {
        await getAccount(connection, userATA);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, userATA, publicKey, TOKEN_MINT));
      }

      tx.add(createTransferCheckedInstruction(
        userATA,
        TOKEN_MINT,
        treasuryATA,
        publicKey,
        BET_AMOUNT,
        DECIMALS
      ));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

      // ONE TIME ONLY: Determine winning door from this transaction
      const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      const hash = txInfo?.transaction?.message?.recentBlockhash || '';
      const winner = parseInt(hash.slice(-2), 16) % 3;

      setWinningDoor(winner);           // ← Store it once
      setDoors(['?', '?', '?']);
      setSelected(null);
      setResult('Bet placed! Pick a door.');
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

    // Reveal all doors correctly
    const revealed = doors.map((_, idx) => 
      idx === winningDoor ? 'Trophy' : 'Bomb'
    );
    setDoors(revealed);

    if (i === winningDoor) {
      const winAmount = (BET_AMOUNT * PAYOUT).toString();
      setResult(`WIN! +${Number(winAmount)/1e6} $GROKGAME`);
      onWin?.(winAmount, 'Doors');
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
      <p className="mb-4 text-gray-300">Pick a door → 1 in 3 chance for 3x!</p>
      <p className="mb-4 text-sm text-gray-400">
        Balance: {(Number(balance) / 1e6).toLocaleString()} $GROKGAME
      </p>

      {result && <p className="mb-6 p-4 bg-black/70 rounded-xl text-xl font-bold">{result}</p>}

      {/* BET BUTTON */}
      {winningDoor === null && (
        <button
          onClick={start}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? 'Placing bet...' : 'BET 25K'}
        </button>
      )}

      <div className="flex justify-center gap-8 mt-10">
        {doors.map((door, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={loading || selected !== null || winningDoor === null}
            className={`w-32 h-48 rounded-2xl text-6xl font-bold transition-all shadow-2xl border-4 border-zinc-700
              ${selected === null ? 'bg-gradient-to-br from-gray-800 to-gray-900 hover:scale-110 cursor-pointer' : ''}
              ${selected === i && door === 'Trophy' ? 'bg-gradient-to-br from-yellow-400 to-amber-600 scale-125 animate-pulse' : ''}
              ${selected === i && door === 'Bomb' ? 'bg-gradient-to-br from-red-600 to-red-900 scale-125' : ''}
              ${selected !== null && selected !== i && door === 'Trophy' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : ''}
              ${selected !== null && selected !== i && door === 'Bomb' ? 'bg-gray-700' : ''}
            `}
          >
            {selected !== null ? door : '?'}
          </button>
        ))}
      </div>

      {selected !== null && (
        <button
          onClick={reset}
          className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-full text-xl transition"
        >
          Play Again
        </button>
      )}
    </div>
  );
}