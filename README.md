# 🧠 AI Therapist

*A conversational AI companion designed to listen, reflect, and respond with empathy — via text or voice.*

---

## 🌟 Overview

AI Therapist is an interactive web application that provides **therapy-style support** through natural conversations.
Users can communicate via **voice** or **text**, receiving thoughtful, empathetic replies.
The app encourages self-expression and reflection while avoiding generic or impersonal advice.

---

## ✨ Key Features

* **Two Modes of Use**

  * **Normal Mode** → Login/Signup with a personal profile for mood tracking and progress.
  * **Anonymous Mode** → Quick access without registration; sessions are private.

* **Voice & Text Conversations**
  Users can type messages or speak naturally. Responses include **text** and **AI-generated speech**, giving a realistic conversational experience.

* **Therapist-Style Interaction**
  Engages users with **empathetic dialogue**, active listening cues, and gentle guidance rather than standard responses.

* **Lightweight User Profile**
  Tracks mood history, conversation streaks, and user session data (Normal Mode only).

* **Real-Time Audio Feedback**
  Voice responses are generated in real-time, providing a natural interaction flow.

* **Crisis Detection & Alerts**
  AI identifies critical situations and triggers alert messages to encourage seeking professional help.

---

## 🏗️ Tech Stack & Architecture

* **Frontend**: React + Tailwind CSS; fully responsive chat interface with **text bubbles**, **voice panel**, and **animated UI elements** like dynamic orb and mic controls.
* **Backend**: FastAPI service handling conversation logic, session management, and integration with AI models.
* **AI Model**: Large language model for therapist-style text generation.
* **Speech Modules**:

  * **STT (Speech-to-Text)** → Converts user voice input to text.
  * **TTS (Text-to-Speech)** → Generates realistic voice replies.
* **Database**: Lightweight storage for user profiles, session data, and conversation history in Normal Mode.

---

## ⚠️ Disclaimer

**AI Therapist is not a substitute for professional therapy.**
It is a supportive tool designed to encourage reflection, self-expression, and emotional awareness.
In case of crisis, users should seek help from licensed mental health professionals.
