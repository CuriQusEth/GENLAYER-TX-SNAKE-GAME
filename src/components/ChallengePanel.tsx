import React, { useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Swords, Send } from 'lucide-react';

export const ChallengePanel: React.FC = () => {
  const [opponent, setOpponent] = useState('');
  const { createChallenge } = useGenLayer();

  const handleSend = async () => {
    if (!opponent) return;
    await createChallenge(opponent);
    setOpponent('');
    alert('Challenge sent to chain!');
  };

  return (
    <div className="w-full max-w-md glitch-border p-6 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Swords className="text-matrix" />
        <h2 className="text-lg arcade-font">PVP CHALLENGES</h2>
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="OPPONENT WALLET ADDR"
          className="flex-1 bg-black border border-matrix/50 p-2 text-xs font-mono focus:outline-none focus:border-matrix"
        />
        <button
          onClick={handleSend}
          className="bg-matrix text-black p-2 hover:bg-matrix-dark transition-colors"
        >
          <Send size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] arcade-font text-matrix/50">ACTIVE CHALLENGES</p>
        <div className="text-xs font-mono text-center py-4 border border-matrix/10 italic">
          No pending challenges found.
        </div>
      </div>
    </div>
  );
};
