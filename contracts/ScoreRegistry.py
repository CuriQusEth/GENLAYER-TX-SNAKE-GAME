# ScoreRegistry.py
# GenLayer Intelligent Contract

from genlayer import IntelligentContract, State, method

class ScoreRegistry(IntelligentContract):
    def __init__(self):
        self.scores = State.dict() # wallet -> { best_score, total_apples, total_games, play_style }
        self.leaderboard = State.list() # top 10 entries

    @method
    def submit_score(self, player: str, score: int, apples_eaten: int, survival_seconds: int, replay_hash: str):
        # Update player stats
        stats = self.scores.get(player, {
            "best_score": 0,
            "total_apples": 0,
            "total_games": 0,
            "play_style": "unknown"
        })
        
        if score > stats["best_score"]:
            stats["best_score"] = score
            
        stats["total_apples"] += apples_eaten
        stats["total_games"] += 1
        
        # AI Classification (Conceptual for GenLayer LLM)
        # In GenLayer, you can call an LLM to process data
        if stats["total_games"] % 3 == 0: # Re-classify every 3 games
            prompt = f"Classify this Snake player's style based on these stats: {apples_eaten} apples, {survival_seconds}s survival. Styles: aggressive, cautious, chaotic, efficient. Return ONLY the style name."
            # result = self.ai.prompt(prompt) # GenLayer AI API
            # stats["play_style"] = result
            pass # Placeholder for actual GenLayer AI call logic

        self.scores.set(player, stats)
        self._update_leaderboard(player, stats["best_score"])

    def _update_leaderboard(self, player: str, score: int):
        lb = self.leaderboard.get()
        # Simple leaderboard update logic
        new_entry = {"player": player, "score": score}
        lb.append(new_entry)
        lb.sort(key=lambda x: x["score"], reverse=True)
        self.leaderboard.set(lb[:10])

    @method
    def get_leaderboard(self) -> list:
        return self.leaderboard.get()

    @method
    def get_player_stats(self, player: str) -> dict:
        return self.scores.get(player, {})
