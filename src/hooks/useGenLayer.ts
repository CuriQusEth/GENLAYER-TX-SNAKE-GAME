import { useState, useCallback } from 'react';
import { createClient } from 'genlayer-js';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const GENLAYER_API_KEY = import.meta.env.VITE_GENLAYER_API_KEY;

export function useGenLayer() {
  const [isConnecting, setIsConnecting] = useState(false);

  const getClient = useCallback(() => {
    const provider = typeof window !== 'undefined' ? (window as any).ethereum : null;
    const config: any = { 
      chain: 'studionet',
    };
    
    if (provider) {
      config.provider = provider;
    }
    
    if (GENLAYER_API_KEY) {
      config.apiKey = GENLAYER_API_KEY;
    }
    
    return (createClient as any)(config);
  }, []);

  const submitScore = useCallback(async (
    player: string,
    score: number,
    apples: number,
    survival: number,
    deathsNearWall: number,
    replayHash: string
  ) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      console.log('📡 Sending TX to:', CONTRACT_ADDRESS);
      console.log('👤 Player Account:', player);
      console.log('📊 Args:', [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash]);
      
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'submit_score',
        args: [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash],
      });
      console.log('✅ TX sent successfully:', tx);
      return tx;
    } catch (error: any) {
      console.error('❌ Error submitting score:', error);
      // Log more details if available
      if (error.data) console.error('Error data:', error.data);
      if (error.message) console.error('Error message:', error.message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getLeaderboard = useCallback(async () => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_leaderboard',
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, [getClient]);

  const getPlayerStats = useCallback(async (address: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_player_stats',
        args: [address],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }, [getClient]);

  const createChallenge = useCallback(async (challenger: string, opponent: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: challenger,
        functionName: 'create_challenge',
        args: [challenger, opponent],
      });
      return tx;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const submitChallengeScore = useCallback(async (challengeId: string, player: string, score: number) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'submit_challenge_score',
        args: [challengeId, player, BigInt(score)],
      });
      return tx;
    } catch (error) {
      console.error('Error submitting challenge score:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const resolveChallenge = useCallback(async (challengeId: string, player: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'resolve_challenge',
        args: [challengeId],
      });
      return tx;
    } catch (error) {
      console.error('Error resolving challenge:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getChallenge = useCallback(async (challengeId: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_challenge',
        args: [challengeId],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }
  }, [getClient]);

  return {
    submitScore,
    getLeaderboard,
    getPlayerStats,
    createChallenge,
    submitChallengeScore,
    resolveChallenge,
    getChallenge,
    isConnecting
  };
}
