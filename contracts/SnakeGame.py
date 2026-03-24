# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class SnakeGame(gl.Contract):
    # ─── Persistent Storage ───────────────────────────────────────────
    # Player stats: address -> { best_score, total_apples, total_games, play_style, replay_hash }
    player_best_score:   TreeMap[str, u256]
    player_total_apples: TreeMap[str, u256]
    player_total_games:  TreeMap[str, u256]
    player_play_style:   TreeMap[str, str]
    player_replay_hash:  TreeMap[str, str]

    # Leaderboard: ranked list of addresses (top 10 by best score)
    leaderboard_addresses: DynArray[str]
    leaderboard_scores:    DynArray[u256]

    # Challenges: challenge_id -> fields stored in parallel maps
    challenge_challenger:       TreeMap[str, str]
    challenge_opponent:         TreeMap[str, str]
    challenge_challenger_score: TreeMap[str, u256]
    challenge_opponent_score:   TreeMap[str, u256]
    challenge_status:           TreeMap[str, str]   # "pending" | "resolved"
    challenge_winner:           TreeMap[str, str]
    challenge_counter:          u256

    # ─── Constructor ──────────────────────────────────────────────────
    def __init__(self) -> None:
        self.leaderboard_addresses = DynArray[str]([])
        self.leaderboard_scores    = DynArray[u256]([])
        self.challenge_counter     = u256(0)

    # ═════════════════════════════════════════════════════════════════
    #  SCORE REGISTRY
    # ═════════════════════════════════════════════════════════════════

    @gl.public.write
    def submit_score(
        self,
        player: str,
        score: u256,
        apples_eaten: u256,
        survival_seconds: u256,
        deaths_near_wall: u256,
        replay_hash: str,
    ) -> None:
        """
        Called at game-over. Records the result, updates the leaderboard,
        and triggers an AI play-style classification stored on-chain.
        """
        # ── Update cumulative stats ──────────────────────────────────
        prev_apples = self.player_total_apples.get(player, u256(0))
        prev_games  = self.player_total_games.get(player, u256(0))

        self.player_total_apples[player] = prev_apples + apples_eaten
        self.player_total_games[player]  = prev_games  + u256(1)
        self.player_replay_hash[player]  = replay_hash

        # ── Update best score ────────────────────────────────────────
        prev_best = self.player_best_score.get(player, u256(0))
        if score > prev_best:
            self.player_best_score[player] = score
            self._update_leaderboard(player, score)

        # ── AI play-style classification ─────────────────────────────
        style = self._classify_play_style(apples_eaten, survival_seconds, deaths_near_wall)
        self.player_play_style[player] = style

    # ─── Private: AI classification ──────────────────────────────────
    def _classify_play_style(
        self,
        apples: u256,
        survival: u256,
        deaths_near_wall: u256,
    ) -> str:
        """
        Uses GenLayer's on-chain LLM execution to classify the player's
        play style as one of: aggressive | cautious | chaotic | efficient
        """
        prompt = (
            f"You are a game analytics AI. A player just finished a Snake game with these stats:\n"
            f"- Apples eaten: {apples}\n"
            f"- Survival time (seconds): {survival}\n"
            f"- Deaths caused by hitting a wall: {deaths_near_wall}\n\n"
            f"Based on these numbers, classify the player's play style using EXACTLY ONE of "
            f"these four labels: aggressive, cautious, chaotic, efficient.\n"
            f"Rules:\n"
            f"- 'aggressive': high apples, low survival (rushed and bold)\n"
            f"- 'cautious': low apples, high survival (avoids risk)\n"
            f"- 'chaotic': high wall deaths, inconsistent stats\n"
            f"- 'efficient': high apples AND high survival (optimal play)\n"
            f"Respond with a single lowercase word only. No punctuation, no explanation."
        )
        result = gl.exec_prompt(prompt)
        clean  = result.strip().lower()
        valid  = ["aggressive", "cautious", "chaotic", "efficient"]
        return clean if clean in valid else "chaotic"

    # ─── Private: leaderboard maintenance ────────────────────────────
    def _update_leaderboard(self, player: str, score: u256) -> None:
        """Keeps leaderboard sorted, max 10 entries."""
        MAX = 10

        # Remove existing entry for this player if present
        new_addresses = DynArray[str]([])
        new_scores    = DynArray[u256]([])
        for i in range(len(self.leaderboard_addresses)):
            if self.leaderboard_addresses[i] != player:
                new_addresses.append(self.leaderboard_addresses[i])
                new_scores.append(self.leaderboard_scores[i])

        # Insert in sorted position (descending)
        inserted = False
        final_addresses = DynArray[str]([])
        final_scores    = DynArray[u256]([])
        for i in range(len(new_scores)):
            if not inserted and score >= new_scores[i]:
                final_addresses.append(player)
                final_scores.append(score)
                inserted = True
            final_addresses.append(new_addresses[i])
            final_scores.append(new_scores[i])
        if not inserted:
            final_addresses.append(player)
            final_scores.append(score)

        # Trim to MAX
        trimmed_addresses = DynArray[str]([])
        trimmed_scores    = DynArray[u256]([])
        for i in range(min(MAX, len(final_addresses))):
            trimmed_addresses.append(final_addresses[i])
            trimmed_scores.append(final_scores[i])

        self.leaderboard_addresses = trimmed_addresses
        self.leaderboard_scores    = trimmed_scores

    # ─── Public read methods ──────────────────────────────────────────

    @gl.public.view
    def get_leaderboard(self) -> str:
        """
        Returns the top-10 leaderboard as a JSON string.
        Format: [{"rank":1,"address":"0x...","score":42}, ...]
        """
        entries = []
        for i in range(len(self.leaderboard_addresses)):
            addr  = self.leaderboard_addresses[i]
            score = self.leaderboard_scores[i]
            style = self.player_play_style.get(addr, "unknown")
            entries.append(
                f'{{"rank":{i+1},"address":"{addr}",'
                f'"score":{score},"play_style":"{style}"}}'
            )
        return "[" + ",".join(entries) + "]"

    @gl.public.view
    def get_player_stats(self, player: str) -> str:
        """
        Returns a single player's stats as a JSON string.
        """
        best   = self.player_best_score.get(player,   u256(0))
        apples = self.player_total_apples.get(player, u256(0))
        games  = self.player_total_games.get(player,  u256(0))
        style  = self.player_play_style.get(player,   "unknown")
        replay = self.player_replay_hash.get(player,  "")
        return (
            f'{{"address":"{player}",'
            f'"best_score":{best},'
            f'"total_apples":{apples},'
            f'"total_games":{games},'
            f'"play_style":"{style}",'
            f'"last_replay_hash":"{replay}"}}'
        )

    # ═════════════════════════════════════════════════════════════════
    #  CHALLENGE REGISTRY (PvP)
    # ═════════════════════════════════════════════════════════════════

    @gl.public.write
    def create_challenge(self, challenger: str, opponent: str) -> str:
        """
        Opens a new PvP challenge. Returns the challenge ID.
        Both players must call submit_challenge_score before resolving.
        """
        self.challenge_counter = self.challenge_counter + u256(1)
        cid = str(self.challenge_counter)

        self.challenge_challenger[cid]       = challenger
        self.challenge_opponent[cid]         = opponent
        self.challenge_challenger_score[cid] = u256(0)
        self.challenge_opponent_score[cid]   = u256(0)
        self.challenge_status[cid]           = "pending"
        self.challenge_winner[cid]           = ""

        return cid

    @gl.public.write
    def submit_challenge_score(
        self,
        challenge_id: str,
        player: str,
        score: u256,
    ) -> None:
        """
        Records a player's score for a given challenge.
        Can be called by either the challenger or the opponent.
        """
        cid = challenge_id
        status = self.challenge_status.get(cid, "")
        if status != "pending":
            return  # challenge already resolved or doesn't exist

        challenger = self.challenge_challenger.get(cid, "")
        opponent   = self.challenge_opponent.get(cid, "")

        if player == challenger:
            self.challenge_challenger_score[cid] = score
        elif player == opponent:
            self.challenge_opponent_score[cid] = score

    @gl.public.write
    def resolve_challenge(self, challenge_id: str) -> str:
        """
        Compares scores and sets the winner. Returns the winner's address.
        Call this after both players have submitted their scores.
        """
        cid = challenge_id
        status = self.challenge_status.get(cid, "")
        if status != "pending":
            return self.challenge_winner.get(cid, "already_resolved")

        c_score = self.challenge_challenger_score.get(cid, u256(0))
        o_score = self.challenge_opponent_score.get(cid, u256(0))

        challenger = self.challenge_challenger.get(cid, "")
        opponent   = self.challenge_opponent.get(cid, "")

        if c_score >= o_score:
            winner = challenger
        else:
            winner = opponent

        self.challenge_winner[cid] = winner
        self.challenge_status[cid] = "resolved"
        return winner

    @gl.public.view
    def get_challenge(self, challenge_id: str) -> str:
        """
        Returns challenge details as a JSON string.
        """
        cid = challenge_id
        return (
            f'{{"challenge_id":"{cid}",'
            f'"challenger":"{self.challenge_challenger.get(cid,"")}",'
            f'"opponent":"{self.challenge_opponent.get(cid,"")}",'
            f'"challenger_score":{self.challenge_challenger_score.get(cid, u256(0))},'
            f'"opponent_score":{self.challenge_opponent_score.get(cid, u256(0))},'
            f'"status":"{self.challenge_status.get(cid,"")}",'
            f'"winner":"{self.challenge_winner.get(cid,"")}"'
            f'}}'
        )
