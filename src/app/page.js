'use client';

import Image from 'next/image';
import DoorsGame from './DoorsGame';
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black flex flex-col items-center justify-center p-8">
      <Image src="/logo.png" alt="$GROKGAME" width={220} height={220} className="rounded-full mb-8 shadow-2xl shadow-purple-600/50" />
      
      <h1 className="text-7xl md:text-9xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 drop-shadow-2xl">
        $GROKGAME
      </h1>
      
      <p className="text-2xl md:text-4xl mb-6 text-gray-100 font-bold text-center max-w-4xl">
        The only memecoin with real playable games
      </p>
      <p className="text-xl md:text-2xl mb-12 text-gray-300 text-center max-w-4xl">
        Use $GROKGAME to play → win daily prize pools<br />
        <span className="text-green-400 font-bold">More games dropping every week</span>
      </p>

      <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-10 max-w-2xl w-full border border-purple-600/50 shadow-2xl">
        <DoorsGame />
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-400 mb-2">Contract Address</p>
        <p className="text-white font-mono text-sm md:text-lg break-all bg-black/40 px-6 py-3 rounded-lg inline-block border border-purple-800">
          2ZAm4d5FqtFjDpxbUgoksdTAXDnDmCHK2zP2yvxApump
        </p>
      </div>

      <p className="mt-12 text-gray-300 text-lg">
        Built by 0xSquid_Sol & Grok himself. LFG.
      </p>
    </main>
  );
}