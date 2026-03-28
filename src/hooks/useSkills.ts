import { GoogleGenAI } from "@google/genai";

export function useSkills() {
  async function callAI(prompt: string, systemPrompt?: string) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return null;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        }
      });
      return response.text;
    } catch (error) {
      console.error('Error calling AI API:', error);
      return null;
    }
  }

  async function classifyPlayStyle(data: { apples: number; survival_seconds: number; deaths_near_wall: number }) {
    const prompt = `Analyze this Snake game data:
- Apples: ${data.apples}
- Survival: ${data.survival_seconds}s
- Wall deaths: ${data.deaths_near_wall}

Classify the play style as exactly one of: aggressive, cautious, chaotic, efficient.
Also provide a confidence score (0-100) and a short 1-sentence reasoning.
Return ONLY a JSON object with keys: "play_style", "confidence", "reasoning".`;

    const result = await callAI(prompt, 'You are a game analytics AI. Output only valid JSON.');
    if (!result) return { play_style: 'unknown', confidence: 0, reasoning: 'API error' };
    
    try {
      // Extract JSON if it's wrapped in markdown
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse play style JSON:', result);
      return { play_style: 'unknown', confidence: 0, reasoning: 'Parse error' };
    }
  }

  async function analyzeReplay(data: { moves: string[]; score: number }) {
    const prompt = `Analyze this Snake gameplay:
- Score: ${data.score}
- Moves count: ${data.moves.length}
- Sample moves: ${data.moves.slice(0, 20).join(', ')}...

Determine the pattern (looping, explorer, corner-hugger, random), risk level (low, medium, high), and a 1-sentence insight.
Return ONLY a JSON object with keys: "pattern", "risk_level", "insight".`;

    const result = await callAI(prompt, 'You are a game analytics AI. Output only valid JSON.');
    if (!result) return { pattern: 'unknown', risk_level: 'unknown', insight: 'API error' };

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse replay JSON:', result);
      return { pattern: 'unknown', risk_level: 'unknown', insight: 'Parse error' };
    }
  }

  async function narrateChallenge(data: { challenger_score: number; opponent_score: number; winner: string }) {
    const prompt = `Generate a short, epic 1-sentence commentary for a Snake PvP match.
Challenger score: ${data.challenger_score}
Opponent score: ${data.opponent_score}
Winner: ${data.winner}

Return ONLY a JSON object with key: "commentary".`;

    const result = await callAI(prompt, 'You are an epic esports commentator. Output only valid JSON.');
    if (!result) return { commentary: 'A match for the ages.' };

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse commentary JSON:', result);
      return { commentary: 'A match for the ages.' };
    }
  }

  async function blackHoleOracle(data: { player: string; score: number }) {
    const prompt = `A snake just entered a black hole tile!
Player: ${data.player}
Score: ${data.score}

Generate a cryptic, lore-rich 1-sentence message from "The Chain".
Also decide an effect: "none", "bonus", or "curse".
Return ONLY a JSON object with keys: "message", "effect".`;

    const result = await callAI(prompt, 'You are the Black Hole Oracle. Output only valid JSON.');
    if (!result) return { message: 'The void consumes all.', effect: 'none' };

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse oracle JSON:', result);
      return { message: 'The void consumes all.', effect: 'none' };
    }
  }

  return {
    classifyPlayStyle,
    analyzeReplay,
    narrateChallenge,
    blackHoleOracle
  };
}
