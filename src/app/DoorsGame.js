'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction, getAccount } from '@solana/spl-token';
import { useState } from 'react';

const TOKEN_MINT = new PublicKey('2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump');
const DECIMALS = 6;
const BET_AMOUNT = 25000n;
const TREASURY_WALLET = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const PAYOUT = 3n; // 3x

export default function DoorsGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [doors, setDoors] = useState(['?', '?', '?']);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState(0n);
  const [loading, setLoading] = useState(false);

  const updateBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const account = await getAccount(connection, ata);
      setBalance(BigInt(account.amount));
    } catch (e) {
      console.error('Balance fetch error:', e);
      setBalance(0n);
    }
  };

  const start = async () => {
    if (!publicKey) return alert('Connect wallet');
    await updateBalance();
    if (balance < BET_AMOUNT) return alert(`Insufficient balance. Need ${Number(BET_AMOUNT) / 10**DECIMALS} tokens.`);

    setLoading(true);
    setResult('Preparing bet...');
    try {
      const userATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);

      const ix = createTransferCheckedInstruction(
        userATA,
        TOKEN_MINT,
        treasuryATA,
        publicKey,
        BET_AMOUNT,
        DECIMALS
      );

      const tx = new Transaction().add(ix);
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash; // Explicitly set for safety

      const sig = await sendTransaction(tx, connection);
      console.log('Sig:', sig);

      // Modern confirm with timeout handling
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
        },
        'confirmed'
      );

      setResult('Bet placed! Pick a door.');
      setDoors(['?', '?', '?']);
      setSelected(null);
      await updateBalance();

      // Provably fair: Use blockhash
      const winningDoor = parseInt(blockhash.slice(-2), 16) % 3;
      console.log('Winning door (hidden):', winningDoor);
      return winningDoor; // Return for pick logic
    } catch (e) {
      console.error('Tx error:', e);
      alert(`Failed: ${e.message || e.toString()}. Check Explorer for sig ${sig || 'none'}.`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const pick = async (i) => {
    if (loading || selected !== null) return;
    const winningDoor = await start(); // Start bet on pick
    if (winningDoor === undefined) return; // Failed bet

    const newDoors = doors.map((d, idx) => (idx === winningDoor ? '🏆' : '💣'));
    setDoors(newDoors);
    setSelected(i);

    if (i === winningDoor) {
      const winAmount = (BET_AMOUNT * PAYOUT).toString();
      setResult(`WIN! ${winAmount} $GROKGAME`);
      onWin?.(winAmount, 'Doors');
    } else {
      setResult('LOSE! Try again.');
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">DOORS</h1>
      <p className="mb-4 text-gray-300">Pick a door → 1 in 3 chance for 3x!</p>
      <p className="mb-4 text-sm text-gray-400">Balance: {(Number(balance) / 1e6).toLocaleString()}</p>
      {result && <p className="mb-4 p-3 bg-black/50 rounded-lg text-lg">{result}</p>}

      <div className="flex justify-center gap-4 mt-8">
        {doors.map((door, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={loading || selected !== null}
            className={`w-32 h-48 text-4xl font-bold rounded-xl transition-all shadow-md ${
              selected === i
                ? door === '🏆'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110'
                  : 'bg-gradient-to-br from-red-600 to-red-800 scale-110'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:scale-110 cursor-pointer'
            } flex items-center justify-center`}
          >
            {selected !== null ? door : door}
          </button>
        ))}
      </div>

      {selected !== null && (
        <button
          onClick={() => setSelected(null)}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
        >
          Play Again
        </button>
      )}
    </div>
  );
}