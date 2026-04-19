EcoSentinel
AI-Powered Environmental Intelligence & Emergency Response System

EcoSentinel is a next-generation, AI-driven platform designed to monitor environmental conditions, predict hazards, and enable real-time emergency response across rural and semi-urban regions.

It connects Citizens → Sarpanch → Inspectors through a unified system that delivers actionable insights, predictive alerts, and rapid communication pipelines.

 Live Deployment

 https://ld-hackathon.vercel.app

 Problem Statement

Environmental hazards like air pollution, gas leaks, and fire risks often go unnoticed until it’s too late due to:

 No real-time monitoring
 Lack of predictive systems
 Delayed communication
 Poor coordination between authorities
 Our Solution

EcoSentinel solves this by providing:

 Real-time environmental monitoring
 AI-based predictive modeling (client-side ML)
 Role-based dashboards (Citizen, Sarpanch, Inspector)
 Instant emergency alert system (SMS broadcast)
 Multilingual AI assistant

User (Citizen / Sarpanch / Inspector)
        │
        ▼
Frontend (React - src/)
        │
        ├── UI Components (components/)
        ├── Dashboards (components/dashboard/)
        ├── Chat/NLP UI (components/chat/)
        │
        ▼
Client-Side ML (src/lib/)
        │
        ▼
Backend API (api/)
        │
        ├── NLP Engine
        ├── Alert Controller
        │
        ▼
External Services (Twilio SMS)
        │
        ▼
Citizens (Real-world Alerts)

Architecture Deep Explanation
1. Frontend Layer (React + Vite)
Built with React 19 + TypeScript + Vite
Handles:
Dashboards
Visualization
User interaction

Key feature:
--> Heavy client-side processing (reduces server load)

2. 🤖 Client-Side ML Engine (CORE INNOVATION )
Runs directly in browser
Performs:
Time-series forecasting
AQI prediction
Uses:
Statistical feature extraction
Lightweight XGBoost-like logic

--> Advantages:

Zero latency
Works offline
No server cost

3. ⚙️ Backend Layer (FastAPI)
Handles:
API requests
Emergency triggers
NLP processing
Acts as:
--> Control center for alerts & communication

4. 💬 NLP Engine (Multilingual AI)
Supports:
English
Hindi
Gujarati
Detects:
Pollution reports
Emergency queries
Provides:
--> Role-based intelligent responses

5.  Alert Engine (Critical Feature)
Triggered during:
Gas leaks
High AQI
Emergencies

Flow:

Inspector → Backend → Twilio → SMS → Citizens

--> Ensures instant real-world communication

6.  Role-Based Dashboards
--> Citizen Dashboard
AQI status
Health advice
Report issues

--> Sarpanch Dashboard
Local alerts
Complaint management
Simple UI (for non-technical users)

--> Inspector Dashboard
Advanced analytics
Violations tracking
Emergency controls
 Advanced Features
 In-Browser ML Prediction
No backend ML dependency
Fast, scalable
 Multilingual AI Assistant
Inclusive design
Works for rural users
 Emergency Broadcast System
Real-time SMS alerts
Life-saving feature
Data Visualization
Recharts + Heatmaps
Interactive analytics

--> Project Structure
LD-Hackathon/
│
└── env-monitor/
    │
    ├── src/  🔵 (Frontend Layer)
    │   │
    │   ├── components/
    │   │   ├── dashboard/     → Role-based dashboards (Sarpanch, Inspector)
    │   │   ├── chat/          → NLP Chat UI
    │   │   └── ui/            → Reusable UI components
    │   │
    │   ├── pages/             → Routing / screens
    │   ├── lib/               → ML logic (prediction engine 🚀)
    │   ├── hooks/             → State & logic handling
    │   ├── data/              → Static/mock data
    │   └── types/             → TypeScript models
    │
    ├── api/  🟢 (Backend Layer)
    │   │
    │   ├── main.py            → FastAPI entry point
    │   ├── routes             → API endpoints
    │   ├── services/          → NLP + Alert logic
    │   └── utils/             → Helpers
    │
    ├── public/                → Static assets
    ├── scripts/               → Utility scripts
    └── README.md

--> Tech Stack
Layer	Technology
Frontend	React, TypeScript, Vite
UI	Tailwind CSS, Framer Motion
Backend	FastAPI (Python)
ML	Client-side Time Series Model
Visualization	Recharts
Communication	Twilio API
-->Setup Instructions
--> Backend Setup
cd env-monitor/api
pip install fastapi uvicorn twilio
python main.py

--> Frontend Setup
cd env-monitor
npm install
npm run dev

Team Contribution (4 Members)
Member	Role
 Member 1	Frontend UI
 Member 2	ML System
 Member 3	Backend APIs
 Member 4	Dashboard & Integration