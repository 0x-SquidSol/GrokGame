'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const TOKEN_MINT = new PublicKey('5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump');
const TREASURY = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');
const BET_LAMPORTS = Math.floor(0.05 * LAMPORTS_PER_SOL);

type Card = { rank: string; suit: string; value: number };
const suits = ['Spade', 'Heart', 'Diamond', 'Club'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of suits) for (const rank of ranks) {
    const value = rank === 'A' ? 11 : 'JQK'.includes(rank) ? 10 : parseInt(rank);
    deck.push({ rank, suit, value });
  }
  return deck.sort(() => Math.random() - 0.5);
};

const handValue = (hand: Card[]) => {
  let val = 0, aces = 0;
  for (const c of hand) { val += c.value; if (c.rank === 'A') aces++; }
  while (val > 21 && aces--) val -= 10;
  return val;
};

const CardVisual = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
  <div className={`relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 bg-white rounded-lg shadow-xl border-2 border-gray-800 flex flex-col justify-between p-2 ${hidden ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
    {hidden ? (
      <div className="text-4xl text-gray-600 font-bold">?</div>
    ) : (
      <>
        <div className={`text-2xl font-black ${card.suit === 'Heart' || card.suit === 'Diamond' ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
        </div>
        <div className={`text-4xl self-center ${card.suit === 'Heart' || card.suit === 'Diamond' ? 'text-red-600' : 'text-black'}`}>
          {card.suit === 'Spade' ? '♠' : card.suit === 'Heart' ? '♥' : card.suit === 'Diamond' ? '♦' : '♣'}
        </div>
        <div className={`text-xl font-black absolute bottom-1 right-2 rotate-180 ${card.suit === 'Heart' || card.suit === 'Diamond' ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
        </div>
      </>
    )}
  </div>
);

export default function BlackjackGame({ onWin }: { onWin: (amount: string, game: string) => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Card[][]>([[]]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [currentHand, setCurrentHand] = useState(0);
  const [phase, setPhase] = useState<'betting'|'playing'|'dealer'|'result'>('betting');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!publicKey) { setHasToken(null); return; }
    (async () => {
      try {
        const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
        const acc = await getAccount(connection, ata);
        setHasToken(acc.amount > BigInt(0));
      } catch { setHasToken(false); }
    })();
  }, [publicKey, connection]);

  const charge = async () => {
    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: publicKey!,
      toPubkey: TREASURY,
      lamports: BET_LAMPORTS,
    }));
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, 'confirmed');
  };

  const startGame = async () => {
    if (!hasToken) return;
    setLoading(true);
    try {
      await charge();
      const d = createDeck();
      setDeck(d.slice(4));
      setPlayerHands([[d[0], d[2]]]);
      setDealerHand([d[1], d[3]]);
      setPhase('playing');
      setMsg('');
    } catch (e: any) { alert(e.message || 'Transaction failed'); }
    finally { setLoading(false); }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newHands = [...playerHands];
    newHands[currentHand].push(newDeck.pop()!);
    setPlayerHands(newHands);
    setDeck(newDeck);
   if (handValue(newHands[currentHand]) > 21) {
  stand();
}
  };

  const stand = () => {
    if (currentHand < playerHands.length - 1) {
      setCurrentHand(currentHand + 1);
    } else {
      setPhase('dealer');
      let dh = [...dealerHand];
      const nd = [...deck];
      while (handValue(dh) < 17) dh.push(nd.pop()!);
      setDealerHand(dh);
      setTimeout(() => {
        setPhase('result');
        const dv = handValue(dh);
        let won = 0;
        playerHands.forEach(h => {
          const pv = handValue(h);
          if (pv > 21) return;
          if (dv > 21 || pv > dv) won += h.length === 2 && pv === 21 ? 0.125 : 0.1;
          else if (pv === dv) won += 0.05;
        });
        if (won > 0) {
          setMsg(`WON ${won.toFixed(3)} SOL!`);
          onWin((won * 1e9).toString(), 'Blackjack');
        } else setMsg('House wins');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 text-white p-4 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between py-6">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-yellow-400 tracking-wider drop-shadow-lg">
            BLACKJACK
          </h1>
          <p className="text-cyan-400 text-sm sm:text-base md:text-lg font-bold mt-2">
            0.05 SOL per Deal • Double • Split
          </p>
        </div>

        {/* Dealer */}
        <div className="text-center my-4">
          <p className="text-xl sm:text-2xl font-bold">Dealer {phase !== 'playing' && `(${handValue(dealerHand)})`}</p>
          <div className="flex justify-center gap-3 flex-wrap mt-4">
            {dealerHand.map((c, i) => <CardVisual key={i} card={c} hidden={phase === 'playing' && i === 1} />)}
          </div>
        </div>

        {/* Player */}
        <div className="my-6">
          {playerHands.map((hand, i) => (
            <div key={i} className="text-center mb-6">
              <p className="text-lg sm:text-xl font-bold">
                Your Hand {playerHands.length > 1 ? i+1 : ''} ({handValue(hand)}{handValue(hand) > 21 ? ' - BUST' : ''})
              </p>
              <div className="flex justify-center gap-3 flex-wrap mt-3">
                {hand.map((c, j) => <CardVisual key={j} card={c} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        <p className="text-center text-2xl sm:text-3xl font-black text-cyan-400 my-6">
          {msg || 'Hold $GROKGAME to play'}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          {phase === 'betting' && (
            <button onClick={startGame} disabled={loading || !hasToken}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 text-white text-2xl font-black px-12 py-6 rounded-full shadow-2xl">
              {loading ? 'CHARGING...' : 'DEAL — 0.05 SOL'}
            </button>
          )}
          {phase === 'playing' && (
            <>
              <button onClick={hit} className="bg-red-600 hover:bg-red-700 text-white text-xl font-black px-10 py-5 rounded-full">HIT</button>
              <button onClick={stand} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xl font-black px-10 py-5 rounded-full">STAND</button>
            </>
          )}
          {phase === 'result' && (
            <button onClick={() => setPhase('betting')} className="bg-green-600 hover:bg-green-700 text-white text-2xl font-black px-12 py-6 rounded-full">
              NEW HAND
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-yellow-600">
          <p className="text-yellow-400 font-bold text-sm sm:text-base">
            Must hold $GROKGAME in your wallet to play
          </p>
        </div>
      </div>
    </div>
  );
}