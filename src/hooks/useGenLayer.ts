import { useState, useCallback } from 'react';
import { createClient } from 'genlayer-js';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const GENLAYER_API_KEY = import.meta.env.VITE_GENLAYER_API_KEY;

export function useGenLayer() {
  const [isConnecting, setIsConnecting] = useState(false);

  const getClient = useCallback(() => {
    // Using API key if provided in environment variables
    return (createClient as any)({ 
      chain: 'studionet',
      apiKey: GENLAYER_API_KEY
    });
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
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'submit_score',
        args: [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash],
      });
      console.log('📡 TX sent:', tx);
      return tx;
    } catch (error) {
      console.error('Error submitting score:', error);
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

  const resolveChallenge = useCallback(async (challengeId: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
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
