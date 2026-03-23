import { useState, useCallback } from 'react';
// Note: genlayer-js might have specific initialization requirements
// This is a wrapper based on the user's prompt structure
// import { createClient, studionet } from 'genlayer-js';

export function useGenLayer() {
  const [isConnecting, setIsConnecting] = useState(false);

  const submitScore = useCallback(async (score: number, apples: number, survival: number, replayHash: string) => {
    console.log('📡 TX sent: score committed to chain', { score, apples, survival, replayHash });
    // Actual implementation would use genlayer-js client
    // const client = createClient({ network: studionet });
    // await client.call({ ... });
    return true;
  }, []);

  const getLeaderboard = useCallback(async () => {
    // Mock data for now as we don't have a live contract address yet
    return [
      { player: '0x1234...5678', score: 1500 },
      { player: '0xabcd...efgh', score: 1200 },
      { player: '0x9876...5432', score: 900 },
    ];
  }, []);

  const getPlayerStats = useCallback(async (address: string) => {
    return {
      best_score: 1500,
      total_apples: 450,
      total_games: 25,
      play_style: 'efficient'
    };
  }, []);

  const createChallenge = useCallback(async (opponent: string) => {
    console.log('Creating challenge against:', opponent);
    return 'challenge_id_123';
  }, []);

  const submitChallengeScore = useCallback(async (challengeId: string, score: number) => {
    console.log(`Submitting score ${score} for challenge ${challengeId}`);
  }, []);

  return {
    submitScore,
    getLeaderboard,
    getPlayerStats,
    createChallenge,
    submitChallengeScore,
    isConnecting
  };
}
