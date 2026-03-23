# ChallengeContract.py
# GenLayer Intelligent Contract

from genlayer import IntelligentContract, State, method

class ChallengeContract(IntelligentContract):
    def __init__(self):
        self.challenges = State.dict() # challenge_id -> { challenger, opponent, challenger_score, opponent_score, status, winner }
        self.challenge_count = State.int(0)

    @method
    def create_challenge(self, challenger: str, opponent: str):
        self.challenge_count.set(self.challenge_count.get() + 1)
        challenge_id = str(self.challenge_count.get())
        self.challenges.set(challenge_id, {
            "challenger": challenger,
            "opponent": opponent,
            "challenger_score": 0,
            "opponent_score": 0,
            "status": "pending",
            "winner": None
        })
        return challenge_id

    @method
    def submit_challenge_score(self, challenge_id: str, player: str, score: int):
        challenge = self.challenges.get(challenge_id)
        if not challenge:
            return "Challenge not found"
            
        if player == challenge["challenger"]:
            challenge["challenger_score"] = score
        elif player == challenge["opponent"]:
            challenge["opponent_score"] = score
        else:
            return "Player not in challenge"
            
        self.challenges.set(challenge_id, challenge)
        
        if challenge["challenger_score"] > 0 and challenge["opponent_score"] > 0:
            self.resolve_challenge(challenge_id)

    @method
    def resolve_challenge(self, challenge_id: str):
        challenge = self.challenges.get(challenge_id)
        if challenge["challenger_score"] > challenge["opponent_score"]:
            challenge["winner"] = challenge["challenger"]
        elif challenge["opponent_score"] > challenge["challenger_score"]:
            challenge["winner"] = challenge["opponent"]
        else:
            challenge["winner"] = "draw"
            
        challenge["status"] = "resolved"
        self.challenges.set(challenge_id, challenge)

    @method
    def get_challenge(self, challenge_id: str) -> dict:
        return self.challenges.get(challenge_id)
