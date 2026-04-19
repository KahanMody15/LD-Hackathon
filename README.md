# EcoSentinel 🌍

**AI-Powered Distributed Environmental Intelligence & Emergency Response System**

EcoSentinel is a comprehensive, multi-role platform designed to monitor air quality, manage environmental hazards, and coordinate emergency responses in real-time. Built specifically to bridge the gap between citizens, local administrators (Sarpanch), and regulatory authorities (Inspectors).

## 🚀 Key Features

*   **Multi-Role Dashboards:**
    *   **Public (Resident):** Real-time localized AQI, health advisories, and weather conditions.
    *   **Sarpanch (Village Admin):** Community alerts, local resource management, and direct routing of complaints to authorities.
    *   **Inspector (GSPCB Official):** Regional analytics, violation tracking, compliance enforcement, and emergency response management.
*   **Multilingual AI Assistant:** Built-in offline-capable NLP handling English, Hindi, and Gujarati to guide users on safety, submit complaints, and query statuses natively. 
*   **Emergency SMS Broadcasts:** Built-in Twilio integration for instant mass alerts during severe pollution spikes, gas leaks, or environmental disasters.
*   **Dynamic Data Visualization:** Beautiful and responsive charts, telemetry tables, and glassmorphism UI leveraging Tailwind, Recharts, and Framer Motion.
*   **Comprehensive Reports:** Instantly export analytical data, notices, and metrics securely via PDF and Excel.

## 💻 Tech Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
*   **Backend:** Python, FastAPI, Uvicorn (Offline Engine & Communication Bridge)
*   **Integrations:** Twilio (SMS), PapaParse & SheetJS (Data processing), jsPDF

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18 or above)
*   Python 3.8+

### 1. Setup Backend (FastAPI)

Navigate to the `api` folder and start the server:

```bash
cd env-monitor/api
pip install fastapi uvicorn twilio pydantic
python main.py
```

*Note: For SMS capabilities, you need to set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` environment variables.*
API Server hosts at `http://localhost:8000`.

### 2. Setup Frontend (React + Vite)

Open a new terminal and run:

```bash
cd env-monitor
npm install
npm run dev
```

The application will be live at `http://localhost:5173`.

## 🤝 Project Vision
Developed to bring immediate relief and transparent environmental governance to communities. The system ensures robust data pipelines from deployed sensor nodes, translating raw metrics into actionable intelligence formatted uniquely for whoever needs it—from the local citizen to the chief inspector.
