import os
import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Check for Groq & Gemini API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

def extract_structured_update(raw_text: str, current_status: str, target_date: str, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Multi-stage AI extraction engine:
    1. If GROQ_API_KEY is available, uses Groq Llama 3 LLM (lightning fast inference with structured JSON).
    2. Else if GEMINI_API_KEY is available, uses Google Gemini LLM.
    3. Otherwise, uses TF-IDF cosine similarity & rule-based NLP intent classification.
    """
    # 1. Primary Engine: Groq API
    if GROQ_API_KEY:
        try:
            return _extract_with_groq(raw_text, current_status, target_date, tasks)
        except Exception as e:
            print(f"[AI Extractor] Groq API call fallback triggered: {e}")

    # 2. Secondary Engine: Google Gemini API
    if GEMINI_API_KEY:
        try:
            return _extract_with_gemini(raw_text, current_status, target_date, tasks)
        except Exception as e:
            print(f"[AI Extractor] Gemini API call fallback triggered: {e}")

    # 3. Fallback: Local NLP & Scikit-Learn TF-IDF
    return _extract_with_local_nlp(raw_text, current_status, target_date, tasks)


def _extract_with_groq(raw_text: str, current_status: str, target_date: str, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extracts structured project updates using the official Groq SDK with ultra-low latency Llama-3.
    """
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)
    task_catalog = "\n".join([f"- {t['title']} (Current status: {t.get('status', 'NOT_STARTED')})" for t in tasks])

    system_prompt = (
        "You are an expert Project Delivery AI Assistant. "
        "Analyze raw unstructured delivery communications (emails, Slack messages, call transcripts) "
        "and extract structured JSON status updates with high precision."
    )

    user_prompt = f"""
Analyze this raw unstructured delivery communication:

RAW COMMUNICATION:
\"\"\"{raw_text}\"\"\"

CURRENT PROJECT CONTEXT:
- Current Overall Health: {current_status}
- Current Target Delivery Date: {target_date}
- Known Project Tasks:
{task_catalog}

INSTRUCTIONS:
1. Match mentioned tasks against the catalog and detect their updated status: DONE, IN_PROGRESS, BLOCKED, or NOT_STARTED.
2. If a task is BLOCKED, extract the technical blocker reason.
3. Determine the updated overall project health: ON_TRACK, AT_RISK, BLOCKED, or COMPLETED.
4. Predict the expected completion date in YYYY-MM-DD format (use current target date {target_date} as base).
5. Write a sanitized, professional executive summary suitable for a customer-facing client portal (do not expose internal friction or sensitive credentials issues directly).

Return ONLY a valid JSON object matching this schema:
{{
    "project_status": "ON_TRACK" | "AT_RISK" | "BLOCKED" | "COMPLETED",
    "updates": [
        {{
            "task": "exact task title from catalog",
            "status": "DONE" | "IN_PROGRESS" | "BLOCKED" | "NOT_STARTED",
            "blocker": "internal blocker reason if blocked, else null"
        }}
    ],
    "blockers": ["list of identified blocker strings"],
    "expected_completion": "YYYY-MM-DD",
    "confidence": 0.96,
    "customer_summary": "Clean professional summary for client view"
}}
"""

    chat_completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    content = chat_completion.choices[0].message.content
    result = json.loads(content)
    result["engine"] = f"Groq ({GROQ_MODEL})"
    return result


def _extract_with_gemini(raw_text: str, current_status: str, target_date: str, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extracts structured project updates using the Google GenAI SDK.
    """
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    task_catalog = "\n".join([f"- {t['title']} (Current status: {t.get('status', 'NOT_STARTED')})" for t in tasks])

    prompt = f"""
    You are an expert Project Delivery AI Assistant.
    Analyze this raw unstructured delivery communication (from an email, Slack message, or meeting transcript):
    
    RAW COMMUNICATION:
    \"\"\"{raw_text}\"\"\"

    CURRENT PROJECT CONTEXT:
    - Current Overall Health: {current_status}
    - Current Target Delivery Date: {target_date}
    - Known Project Tasks:
    {task_catalog}

    INSTRUCTIONS:
    1. Identify any mentioned tasks and their new status (DONE, IN_PROGRESS, BLOCKED, or NOT_STARTED).
    2. If a task is BLOCKED, extract the technical internal blocker note AND generate a customer-safe sanitized version.
    3. Determine the updated overall project health (ON_TRACK, AT_RISK, BLOCKED, or COMPLETED).
    4. Predict the expected completion date (YYYY-MM-DD format).
    5. Write an executive customer-safe summary suitable for a client portal.

    Return ONLY a valid JSON object matching this schema:
    {{
        "project_status": "ON_TRACK" | "AT_RISK" | "BLOCKED" | "COMPLETED",
        "updates": [
            {{
                "task": "exact task title from catalog",
                "status": "DONE" | "IN_PROGRESS" | "BLOCKED" | "NOT_STARTED",
                "blocker": "internal blocker reason if blocked, else null"
            }}
        ],
        "blockers": ["list of identified blocker strings"],
        "expected_completion": "YYYY-MM-DD",
        "confidence": 0.94,
        "customer_summary": "Clean professional summary for client view"
    }}
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )

    result = json.loads(response.text)
    result["engine"] = "Google Gemini (1.5-flash)"
    return result


def _extract_with_local_nlp(raw_text: str, current_status: str, target_date: str, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Local NLP intent classification & TF-IDF semantic task matcher (zero external API dependencies).
    """
    lower = raw_text.lower()
    
    # 1. Project Health Sentiment Analysis
    extracted_status = current_status
    if any(k in lower for k in ["blocked", "waiting for credential", "stuck", "pending credential", "delay", "behind"]):
        extracted_status = "AT_RISK"
        if any(k in lower for k in ["critical", "cannot proceed", "rejected", "stopped", "fatal"]):
            extracted_status = "BLOCKED"
    elif any(k in lower for k in ["all complete", "finished all", "go live ready", "sign off achieved"]):
        extracted_status = "COMPLETED"
    elif any(k in lower for k in ["on track", "progressing well", "ahead", "verified", "done"]):
        extracted_status = "ON_TRACK"

    # 2. Semantic Task Association using TF-IDF / Token Overlap
    updates = []
    blockers = []
    
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        task_titles = [t['title'] for t in tasks]
        if task_titles:
            # Split raw text into sentences
            sentences = [s.strip() for s in re.split(r'[.\n!?;]+', raw_text) if len(s.strip()) > 5]
            if not sentences:
                sentences = [raw_text]
                
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(task_titles + sentences)
            
            task_vectors = tfidf_matrix[:len(task_titles)]
            sentence_vectors = tfidf_matrix[len(task_titles):]
            
            sim_matrix = cosine_similarity(sentence_vectors, task_vectors)
            
            matched_tasks = set()
            for s_idx, sentence in enumerate(sentences):
                s_lower = sentence.lower()
                best_task_idx = sim_matrix[s_idx].argmax()
                best_score = sim_matrix[s_idx][best_task_idx]
                
                if best_score > 0.18:
                    matched_task = tasks[best_task_idx]
                    t_title = matched_task['title']
                    
                    if t_title not in matched_tasks:
                        matched_tasks.add(t_title)
                        
                        # Determine status from the specific sentence
                        new_status = matched_task.get('status', 'IN_PROGRESS')
                        blocker = None
                        
                        if any(w in s_lower for w in ['done', 'complete', 'finished', 'verified', 'approved']):
                            new_status = 'DONE'
                        elif any(w in s_lower for w in ['block', 'waiting', 'pending', 'hold', 'credential', 'delay']):
                            new_status = 'BLOCKED'
                            blocker = 'Waiting for customer API credentials. Escalate to account manager.'
                            blockers.append('Customer API credentials pending')
                        elif any(w in s_lower for w in ['progress', 'testing', 'active', 'underway', 'running']):
                            new_status = 'IN_PROGRESS'
                            
                        updates.append({
                            "task": t_title,
                            "task_title": t_title,
                            "status": new_status,
                            "blocker": blocker
                        })
    except Exception:
        # Fallback to direct substring matching
        for task in tasks:
            t_title = task['title']
            t_lower = t_title.lower()
            if any(part in lower for part in t_lower.split() if len(part) > 3):
                new_status = 'DONE' if any(w in lower for w in ['done', 'complete']) else 'IN_PROGRESS'
                blocker = None
                if 'block' in lower or 'credential' in lower:
                    new_status = 'BLOCKED'
                    blocker = 'Customer API credentials pending'
                    blockers.append(blocker)
                    
                updates.append({
                    "task": t_title,
                    "task_title": t_title,
                    "status": new_status,
                    "blocker": blocker
                })

    # Fallback to first active task if none matched
    if not updates and tasks:
        updates.append({
            "task": tasks[0]['title'],
            "task_title": tasks[0]['title'],
            "status": "IN_PROGRESS",
            "blocker": None
        })

    # 3. Expected Completion Extraction
    expected_completion = target_date
    if "friday" in lower:
        today = datetime.now()
        days_ahead = 4 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        expected_completion = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    elif "next week" in lower:
        expected_completion = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    # 4. Customer Safe Summary Generation
    if blockers:
        customer_summary = f"Operational deliverables in progress. Next phase awaiting required authorization credentials."
    else:
        customer_summary = f"All milestone deliverables are progressing on track for scheduled target completion ({expected_completion})."

    return {
        "project_status": extracted_status,
        "updates": updates,
        "blockers": blockers,
        "expected_completion": expected_completion,
        "confidence": 0.94,
        "customer_summary": customer_summary,
        "engine": "Local NLP (TF-IDF Scikit-Learn)"
    }
