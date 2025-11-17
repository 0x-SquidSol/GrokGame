'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const TOKEN_MINT = new PublicKey('5EyVEmwQNj9GHu6vdpRoM9uW36HrowwKefdCui1bpump');
const DECIMALS = 6;
const BET_AMOUNT = 25_000_000_000n;
const TREASURY = new PublicKey('HYvDA63EK9N3G6hvvvz6PiAzMhmSCMB4LVDPW9QYBLWx');

const MULTIPLIERS = [1, 0, 3, 0, 1];
const SLOT_LABELS = ['1x', '0x', '3x', '0x', '1x'];
const SLOT_COLORS = ['#f59e0b', '#ef4444', '#ec4899', '#ef4444', '#f59e0b'];

export default function PlinkoGame({ onWin }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [dropping, setDropping] = useState(false);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState(0n);

  const updateBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const acc = await getAccount(connection, ata);
      setBalance(BigInt(acc.amount));
    } catch {
      setBalance(0n);
    }
  };

  useEffect(() => {
    if (publicKey) updateBalance();
  }, [publicKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 380;
    canvas.height = 680;

    const engine = Matter.Engine.create();
    engine.gravity.y = 0.44;
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas,
      engine,
      options: { width: 380, height: 680, wireframes: false, background: 'transparent' },
    });

    const pegs = [];
    const ROWS = 14;
    const PEG_RADIUS = 9;
    const ROW_HEIGHT = 30;
    const COL_SPACING = 48;
    const START_Y = 90;
    const CENTER_X = 190;

    for (let row = 0; row < ROWS; row++) {
      const y = START_Y + row * ROW_HEIGHT;
      const pegsInRow = row + 5;
      const totalWidth = (pegsInRow - 1) * COL_SPACING;
      const startX = CENTER_X - totalWidth / 2;

      for (let i = 0; i < pegsInRow; i++) {
        const x = startX + i * COL_SPACING;
        pegs.push(
          Matter.Bodies.circle(x, y, PEG_RADIUS, {
            isStatic: true,
            render: { fillStyle: '#e879f9' },
          })
        );
      }
    }

    // Invisible walls
    const walls = [
      Matter.Bodies.rectangle(190, 680, 420, 60, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(-30, 340, 60, 720, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(410, 340, 60, 720, { isStatic: true, render: { visible: false } }),
    ];

    // Slot dividers
    const SLOT_Y = START_Y + ROWS * ROW_HEIGHT + 40;
    for (let i = 0; i <= 5; i++) {
      walls.push(
        Matter.Bodies.rectangle(190 + (i - 2.5) * 76, SLOT_Y + 60, 8, 140, {
          isStatic: true,
          render: { fillStyle: '#ffffff' },
        })
      );
    }

    Matter.Composite.add(engine.world, [...pegs, ...walls]);
    Matter.Render.run(render);

    // Draw prize slots
    const ctx = canvas.getContext('2d');
    const drawSlots = () => {
      ctx.clearRect(0, SLOT_Y + 10, 380, 160);

      SLOT_LABELS.forEach((label, i) => {
        const x = 190 + (i - 2) * 76;
        ctx.fillStyle = SLOT_COLORS[i];
        ctx.fillRect(x - 38, SLOT_Y + 30, 76, 76);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(x - 38, SLOT_Y + 30, 76, 76);

        ctx.font = 'bold 46px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(label, x, SLOT_Y + 68);
        ctx.fillText(label, x, SLOT_Y + 68);
      });
    };

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const animate = () => {
      drawSlots();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  const dropBall = async () => {
    if (!publicKey || dropping || balance < BET_AMOUNT) return;

    setDropping(true);
    setResult('Dropping...');

    try {
      const userATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY);
      const tx = new Transaction();

      try {
        await getAccount(connection, userATA);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, userATA, publicKey, TOKEN_MINT));
      }

      tx.add(
        createTransferCheckedInstruction(
          userATA,
          TOKEN_MINT,
          treasuryATA,
          publicKey,
          BET_AMOUNT,
          DECIMALS
        )
      );

      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      const offset = (parseInt(sig.slice(0, 8), 16) % 280) - 140;

      const ball = Matter.Bodies.circle(190 + offset, 70, 6, { // Smaller ball radius
        restitution: 0.95,
        frictionAir: 0.0002,
        density: 0.01,
        render: { fillStyle: '#fbbf24' },
      });

      Matter.Composite.add(engineRef.current.world, ball);

      let settled = false;
      const check = setInterval(() => {
        if (!settled && ball.position.y > 600 && Math.abs(ball.velocity.y) < 1.5) {
          settled = true;
          clearInterval(check);

          const slot = Math.min(Math.max(Math.floor((ball.position.x - 38) / 76), 0), 4);
          const mult = MULTIPLIERS[slot];
          const winAmount = Number(BET_AMOUNT * BigInt(mult)) / 1e6;

          setResult(
            mult === 3
              ? `JACKPOT 3x → ${winAmount.toLocaleString()} $GROKGAME`
              : mult === 1
              ? `WIN 1x → ${winAmount.toLocaleString()} $GROKGAME`
              : '0x — Try again!'
          );

          if (mult > 0) onWin?.(winAmount.toString(), 'Plinko');

          setTimeout(() => {
            Matter.Composite.remove(engineRef.current.world, ball);
            setDropping(false);
            updateBalance();
          }, 3000);
        }
      }, 16);
    } catch (e) {
      console.error(e);
      setResult('Tx failed');
      setDropping(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-amber-400 to-pink-600 bg-clip-text text-transparent">
          PLINKO
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mt-2">25K bet • up to 3× payout</p>
        <p className="text-lg md:text-xl text-gray-400 mt-1">
          Balance: {(Number(balance) / 1e6).toFixed(0).toLocaleString()} $GROKGAME
        </p>
      </div>

      <div className="w-full max-w-sm">
        <canvas
          ref={canvasRef}
          width={380}
          height={680}
          className="w-full rounded-3xl border-8 border-purple-600 shadow-2xl"
        />
      </div>

      {result && (
        <div className={`px-10 py-6 rounded-3xl text-4xl md:text-5xl font-black shadow-2xl ${
          result.includes('JACKPOT') ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white' :
          result.includes('WIN') ? 'bg-gradient-to-r from-amber-400 to-orange-600 text-black' :
          'bg-red-900/90 text-red-300'
        }`}>
          {result}
        </div>
      )}

      <button
        onClick={dropBall}
        disabled={dropping || balance < BET_AMOUNT}
        className="bg-gradient-to-r from-amber-400 to-pink-600 hover:from-amber-300 hover:to-pink-500 text-black font-black text-5xl md:text-6xl px-16 py-9 rounded-full shadow-2xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
      >
        {dropping ? 'DROPPING...' : 'DROP 25K'}
      </button>
    </div>
  );
}