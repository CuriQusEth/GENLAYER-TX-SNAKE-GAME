import React, { useEffect, useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { getLeaderboard } = useGenLayer();

  useEffect(() => {
    const fetchLB = async () => {
      const data = await getLeaderboard();
      setEntries(data);
    };
    fetchLB();
    const interval = setInterval(fetchLB, 30000);
    return () => clearInterval(interval);
  }, [getLeaderboard]);

  return (
    <div className="w-full max-w-2xl glitch-border p-6 bg-black/40 backdrop-blur-sm">
      <h2 className="text-xl mb-6 text-center arcade-font">WORLD LEADERBOARD</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-matrix/30 text-xs arcade-font">
            <th className="py-2">RANK</th>
            <th className="py-2">ADDRESS</th>
            <th className="py-2 text-right">SCORE</th>
            <th className="py-2 text-right">STYLE</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.player} className="border-b border-matrix/10 hover:bg-matrix/5 transition-colors">
              <td className="py-3 font-mono">#{i + 1}</td>
              <td className="py-3 font-mono text-matrix/80">{entry.player}</td>
              <td className="py-3 font-mono text-right">{entry.score}</td>
              <td className="py-3 text-right">
                <span className="px-2 py-1 text-[10px] bg-matrix/20 text-matrix border border-matrix/50 rounded uppercase">
                  Efficient
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
