# Project Delivery Dashboard

## The Challenge

Customer delivery work—onboarding, implementation milestones, and ongoing tasks—is tracked internally across projects, milestones, and tasks. However, progress updates are scattered across chats, emails, and calls, making it difficult for customers and internal teams to get a unified view of project status.

## Why It Matters

Without a shared dashboard, customers depend on people for status updates. Teams must manually read unstructured messages and convert them into project status, creating unnecessary work and a visibility bottleneck.

## Solution

A unified **Project Delivery Dashboard** that converts unstructured updates into structured project status using high-speed LLM processing (powered by the **Groq API** with Llama 3 models), while providing separate internal and customer-facing views.

### Core Features

* **Projects Overview**: Real-time health status (`ON_TRACK`, `AT_RISK`, `BLOCKED`, `COMPLETED`), progress tracking, and multi-owner allocation.
* **Milestones & Tasks**: Interactive delivery pipeline with clear **Open, In Progress, Blocked, and Done** states.
* **Dual View Isolation**:
  * **Internal Team View**: Full visibility into internal blocker notes, root causes, developer activity feeds, and Linear integration.
  * **Customer Client View**: Verified, customer-safe summaries and sanitized deliverable milestones with client account filtering.
* **AI Ingestion Engine (Groq LLM)**:
  * Ingests unstructured emails, Slack updates, and meeting transcripts.
  * Extracts task state updates, blocker notes, expected completion dates, and customer summaries.
  * Powered by ultra-fast Groq Llama 3 (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with automatic fallback to local Scikit-Learn NLP.
* **Project Issues Management**:
  * Categories: Bug, Feature Request, Question, Support, Implementation.
  * Internal-only vs Customer-visible flags.
* **Activity & Linear Sync**: Timestamped structured activity timeline with Linear webhook integration simulation.
* **Document Vault**: Project document management with visibility access controls.
* **Stale Project Alerts**: Automatically identifies projects with no movement for > 7 days.
* **Natural Language Query Assistant**: Ask conversational delivery questions (e.g. *"Which projects are behind schedule?"*) analyzed across live project data by Groq LLM.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup (FastAPI & Groq)
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Groq API key in backend/.env
# Copy template: cp .env.example .env
# Edit .env and set:
# GROQ_API_KEY=your_groq_api_key_here
# GROQ_MODEL=llama-3.3-70b-versatile

# Run FastAPI backend server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Or simply double click `run_backend.bat` in the root folder.*

### 2. Frontend Setup (React + Vite + TypeScript)
```bash
# Install dependencies
npm install

# Run frontend development server
npm run dev
```
*Or simply double click `run_frontend.bat` in the root folder.*

### 3. Running Automated Tests
```bash
# Test all 9 FastAPI endpoints + Groq extraction
python test_all_apis.py

# Test Groq AI extraction and Natural Language querying
python test_groq_integration.py
```

---

## Data & Scope

The system uses **mock/synthetic project data**, including projects, milestones, tasks, owners, issues, and multi-channel updates.
