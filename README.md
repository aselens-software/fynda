# 🌟 Fynda — Anonymous Matchmaking & Friend-Finder Discord Bot

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" alt="divider" />
</p>

<p align="center">
  <strong>Connect first, vibe authentically, reveal identities when you're both ready.</strong>
</p>

<p align="center">
  <a href="https://discord.js.org"><img src="https://img.shields.io/badge/discord.js-v14.27.0-blue.svg?logo=discord&logoColor=white" alt="Discord.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x%20%2F%206.x-blue?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Mongoose%209.x-green?logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://top.gg/bot/1530886185009021019"><img src="https://img.shields.io/badge/Top.gg-Vote-FF3366?logo=topdotgg&logoColor=white" alt="Top.gg" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-informational.svg" alt="License" /></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" alt="divider" />
</p>

---

## 📖 About Fynda

**Fynda** is a modern, cross-server Discord bot designed to facilitate meaningful friendships and connections without appearance or profile bias. Instead of cold direct messages or superficial listings, Fynda introduces an **interest-driven, fully anonymous matchmaking pool**.

Users customize their preferences (languages, gaming interests, programming topics, study partner search, or general friendship). Fynda’s matchmaking engine evaluates compatibility scores, lets users browse match cards anonymously, and bridges two users into a **real-time, cross-server private chat room**. Identities remain completely shielded until **both parties** mutually choose to execute `/reveal`.

---

## ✨ Key Features

### 🧠 1. Smart Algorithmic Matching
* **Intent Alignment:** Matches based on specific pursuits (`FRIENDSHIP`, `GAMING`, `PROGRAMMING`, `LANGUAGE_EXCHANGE`, `STUDY_PARTNER`, etc.).
* **Language & Hobby Overlap:** Scores pairs based on shared spoken languages and shared passions.
* **Timezone & Activity Window Compatibility:** Evaluates daily active UTC hour overlaps.
* **Compatibility Rating:** Generates a real-time 0%–100% compatibility rating for each match suggestion.

### 🎭 2. Zero-Leak Anonymity
* Discovery profile cards never expose Discord usernames, discriminators, avatars, or user IDs.
* Profiles show solely bio, shared interests, languages, and goals.

### 🌐 3. Real-Time Cross-Server Chat Bridge
* When an invitation is accepted, Fynda creates dedicated, private text channels in each participant's respective guild under a managed category (`Fynda Chats`).
* All communications, text, images, and attachments are bi-directionally relayed with an anonymous tag (`**Anon:**`).
* Users never have to share mutual servers or direct friend requests beforehand.

### 🔓 4. Mutual Identity Reveal (`/reveal`)
* Privacy is maintained until **both** participants independently run `/reveal`.
* Single-sided reveals do not expose any information, guaranteeing zero pressure.

### 🛑 5. Safety & Instant Chat Teardown (`/endchat`)
* Either party can terminate an active session at any moment using `/endchat`.
* Associated channels on both servers are scheduled for automatic deletion within 5 seconds.
* Terminated pairings are archived with `ENDED` status to avoid unwanted re-matches.

---

## ⚡ Slash Commands Reference

| Command | Description |
| :--- | :--- |
| `/editprofile` | Opens an interactive Discord modal to update your languages, interests, intents, and bio. |
| `/profile` | Displays your current discovery profile card and visibility status. |
| `/visibility` | Toggles your profile in the global matchmaking pool (`discoverable: True/False`). |
| `/discover` | Surfaces the most compatible anonymous user profile and allows sending a connection request. |
| `/requests` | Displays incoming connection requests with **Accept & Chat** or **Reject** action buttons. |
| `/reveal` | Votes to reveal Discord identities in an active private chat (requires both users' agreement). |
| `/endchat` | Terminates the private chat and permanently deletes both bridged channels. |
| `/stats` | Shows real-time network reach, total servers, and bot latency. |
| `/help` | Detailed guide on how to configure your profile and use Fynda. |
| `/feedback` | Sends direct suggestions or reports to the developer team via webhook. |

---

## 🏗️ Architecture & Engineering Highlights

Fynda is built according to **Domain-Driven Design (DDD)** and **Clean Architecture** patterns:
