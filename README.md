Here’s a clean, professional **README.md** you can use for your project:

---

# 🐍 SnakeChain: Proof of Play

**SnakeChain: Proof of Play** is a full-stack, blockchain-integrated Snake game built on the **GenLayer studionet**.
It transforms a classic arcade experience into an **on-chain activity engine**, where gameplay events trigger real blockchain transactions and AI-powered insights.

---

## 🚀 Overview

SnakeChain is not just a game — it’s a **Proof of Play system**:

* 🎮 Play Snake in your browser
* ⛓️ Commit your score to the blockchain
* 🧠 Analyze your play style using AI
* 🏆 Compete on a global on-chain leaderboard
* ⚔️ Challenge other players in PvP matches

---

## 🧠 Powered by AI Skills

This project integrates **GenLayer Skills** to enhance gameplay with intelligent analysis:

* **Play Style Classification** (aggressive, cautious, chaotic, efficient)
* **Replay Pattern Analysis**
* **AI-generated PvP Commentary**
* (Optional) Black Hole Oracle events

All AI outputs can be stored **on-chain**, making them verifiable and permanent.

---

## 🛠 Tech Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Frontend        | Vue 3 + TypeScript (Vite)               |
| Game Engine     | HTML5 Canvas API                        |
| Blockchain SDK  | `genlayer-js`                           |
| Smart Contracts | Python (GenLayer Intelligent Contracts) |
| Wallet          | Rabby Wallet                            |
| AI Layer        | GenLayer Skills                         |
| Deployment      | Vercel (frontend), GenLayer studionet   |

---

## 📦 Features

### 🎮 Gameplay

* Classic Snake (20×20 grid)
* Real-time controls (WASD / Arrow Keys)
* Score, length, and survival tracking
* Replay hash generation (SHA-256)

### ⛓️ On-Chain Integration

* Score submissions stored on-chain
* Leaderboard powered by smart contract
* Replay hashes for verifiable gameplay
* Challenge system (PvP)

### 🧠 AI Enhancements

* Play style classification
* Gameplay pattern detection
* Risk analysis
* AI-generated challenge commentary

### ⚔️ PvP Challenges

* Send challenges to other wallets
* Submit scores
* Automatic winner resolution
* AI narration of match results

---

## 📁 Project Structure

```
snakechain/
│
├── contracts/
│   ├── ScoreRegistry.py
│   └── ChallengeContract.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.vue
│   │   │   ├── Leaderboard.vue
│   │   │   ├── ChallengePanel.vue
│   │   │
│   │   ├── composables/
│   │   │   ├── useGenLayer.ts
│   │   │   └── useSkills.ts
│   │   │
│   │   ├── App.vue
│   │   └── main.ts
│   │
│   └── .env
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install GenLayer CLI

```bash
npm install -g genlayer
```

### 2. Initialize Project

```bash
genlayer init
genlayer up
genlayer network set studionet
```

### 3. Create Deployer Account

```bash
genlayer account create --name studio-deployer
```

### 4. Deploy Contracts

```bash
genlayer deploy --contract contracts/ScoreRegistry.py
genlayer deploy --contract contracts/ChallengeContract.py
```

Save both contract addresses.

---

### 5. Setup Frontend

```bash
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install
npm install genlayer-js
```

---

### 6. Configure Environment

Create `.env`:

```env
VITE_CONTRACT_ADDRESS_SCORE=0xYOUR_SCORE_CONTRACT
VITE_CONTRACT_ADDRESS_CHALLENGE=0xYOUR_CHALLENGE_CONTRACT
VITE_SKILLS_ENDPOINT=https://skills.genlayer.com
VITE_SKILLS_API_KEY=your_api_key_here
```

---

### 7. Run Locally

```bash
npm run dev
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push project to GitHub
2. Import into Vercel
3. Set root directory: `frontend/`
4. Add environment variables
5. Disable deployment protection

---

## 🎨 UI Design

* Retro cyberpunk aesthetic
* Neon green (`#00ff41`) primary color
* CRT scanline overlay
* Pixel font: *Press Start 2P*
* Glowing canvas borders
* Animated transaction toasts

---

## 🔐 Wallet Integration

* Uses Rabby Wallet (`window.ethereum`)
* Prompts user to connect wallet
* Displays shortened address in UI

---

## 📡 On-Chain Events

| Event             | Action                   |
| ----------------- | ------------------------ |
| Every 5 apples    | Partial score submission |
| Game over         | Final score submission   |
| Challenge resolve | Winner stored on-chain   |

---

## 🧪 MVP Checklist

* [ ] Playable Snake game
* [ ] Wallet connection working
* [ ] Score submitted on-chain
* [ ] Leaderboard displayed
* [ ] AI play style classification
* [ ] Challenge system functional
* [ ] TX notifications visible
* [ ] Deployed on Vercel

---

## ✨ Future Improvements

* 🌀 Black Hole tiles (on-chain oracle events)
* 🎨 On-chain snake skins
* 📅 Daily challenges
* 🧬 AI-generated opponents
* 🏅 NFT rewards for play styles

---

## 📜 License

MIT License

---

## 💡 Inspiration

Classic Snake meets blockchain + AI:
A new paradigm where **gameplay = verifiable on-chain activity**.

---

If you want, I can also generate:

* a **GitHub-ready repo (with all files prewritten)**
* or the **actual smart contract + frontend code** ready to run 🚀
