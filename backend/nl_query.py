import os
import json
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

def process_natural_language_query(query: str, projects: list, tasks: list, users: list) -> Dict[str, Any]:
    """
    Processes natural language queries against project delivery portfolio.
    1. Uses Groq LLM if GROQ_API_KEY is available.
    2. Falls back to deterministic rule-based semantic filtering.
    """
    if GROQ_API_KEY:
        try:
            return _query_with_groq(query, projects, tasks, users)
        except Exception as e:
            print(f"[NL Query] Groq query fallback triggered: {e}")

    return _query_with_rules(query, projects, tasks, users)


def _query_with_groq(query: str, projects: list, tasks: list, users: list) -> Dict[str, Any]:
    """
    Uses Groq LLM to intelligently analyze portfolio questions and filter projects.
    """
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)

    # Build portfolio snapshot summary for LLM context
    users_map = {u['id']: u['name'] for u in users}
    portfolio_context = []

    for p in projects:
        p_tasks = [t for t in tasks if t['project_id'] == p['id']]
        blocked_tasks = [f"{t['title']} (Blocker: {t.get('blocker', 'Unspecified')})" for t in p_tasks if t['status'] == 'BLOCKED']
        done_tasks = len([t for t in p_tasks if t['status'] == 'DONE'])
        
        portfolio_context.append({
            "id": p['id'],
            "name": p['name'],
            "status": p['status'],
            "progress_percent": p.get('progress', 0),
            "target_date": p.get('target_date'),
            "last_updated": p.get('last_updated'),
            "total_tasks": len(p_tasks),
            "completed_tasks": done_tasks,
            "blocked_items": blocked_tasks,
            "customer_summary": p.get('customer_summary', ''),
            "internal_notes": p.get('internal_notes', '')
        })

    system_prompt = (
        "You are an AI Delivery Intelligence Assistant for an engineering and project operations dashboard. "
        "Analyze the user's natural language question against the provided portfolio projects and tasks data. "
        "Provide a helpful, well-structured, concise markdown answer, and identify all matching project IDs."
    )

    user_prompt = f"""
QUESTION: "{query}"

LIVE PORTFOLIO DATABASE:
{json.dumps(portfolio_context, indent=2)}

INSTRUCTIONS:
1. Provide a direct, professional markdown answer to the user's question, highlighting specific project names, current statuses, progress %, and blockers if relevant.
2. Return an array of matchedProjectIds for projects directly relevant to the user's question (or all project IDs if the query is a general/portfolio-wide overview).

Return ONLY a valid JSON object matching this schema:
{{
    "answer": "Clear markdown answer text with bullet points, project names bolded, and concise operational insights",
    "matchedProjectIds": ["p1", "p2"]
}}
"""

    chat_completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = chat_completion.choices[0].message.content
    parsed = json.loads(content)
    
    return {
        "query": query,
        "answer": parsed.get("answer", "Query processed successfully."),
        "matchedProjectIds": parsed.get("matchedProjectIds", [p['id'] for p in projects]),
        "engine": f"Groq ({GROQ_MODEL})"
    }


def _query_with_rules(query: str, projects: list, tasks: list, users: list) -> Dict[str, Any]:
    """
    Deterministic rule-based query classifier (offline fallback).
    """
    q = query.lower().strip()

    def is_stale(p):
        try:
            last_date = datetime.fromisoformat(p['last_updated'].replace('Z', ''))
            return (datetime.now() - last_date).days > 7
        except Exception:
            return False

    # 1. Behind schedule / At Risk
    if "behind" in q or "risk" in q or "delayed" in q:
        at_risk = [p for p in projects if p['status'] in ('AT_RISK', 'BLOCKED')]
        matched_ids = [p['id'] for p in at_risk]
        answer = f"{len(at_risk)} projects are currently behind schedule or at risk:\n\n"
        for idx, p in enumerate(at_risk, 1):
            p_tasks = [t for t in tasks if t['project_id'] == p['id'] and t['status'] == 'BLOCKED']
            blocker = p_tasks[0]['blocker'] if (p_tasks and p_tasks[0]['blocker']) else "Schedule variance"
            answer += f"{idx}. **{p['name']}** — Status: {p['status']} ({blocker})\n"
        return {"query": query, "answer": answer, "matchedProjectIds": matched_ids, "engine": "Rule Engine"}

    # 2. Blocked
    if "blocked" in q or "blocker" in q:
        blocked = [p for p in projects if p['status'] == 'BLOCKED']
        matched_ids = [p['id'] for p in blocked]
        answer = f"Found {len(blocked)} blocked project(s):\n\n"
        for idx, p in enumerate(blocked, 1):
            p_tasks = [t for t in tasks if t['project_id'] == p['id'] and t['status'] == 'BLOCKED']
            blockers = "\n".join([f"• Task '{t['title']}': {t['blocker'] or 'Milestone blocker'}" for t in p_tasks])
            answer += f"{idx}. **{p['name']}**\n{blockers or '• General authorization blocker'}\n\n"
        return {"query": query, "answer": answer, "matchedProjectIds": matched_ids, "engine": "Rule Engine"}

    # 3. Stale projects
    if "stale" in q or "no movement" in q or "inactive" in q:
        stale = [p for p in projects if is_stale(p)]
        matched_ids = [p['id'] for p in stale]
        answer = f"Found {len(stale)} stale project(s) with no movement for > 7 days:\n\n"
        for idx, p in enumerate(stale, 1):
            answer += f"{idx}. **{p['name']}** — No update for over 7 days\n"
        return {"query": query, "answer": answer, "matchedProjectIds": matched_ids, "engine": "Rule Engine"}

    # 4. On Track / Completed
    if "on track" in q or "healthy" in q or "good" in q or "completed" in q:
        on_track = [p for p in projects if p['status'] in ('ON_TRACK', 'COMPLETED')]
        matched_ids = [p['id'] for p in on_track]
        answer = f"Found {len(on_track)} project(s) on track or completed:\n\n"
        for idx, p in enumerate(on_track, 1):
            answer += f"{idx}. **{p['name']}** — Progress: {p.get('progress', 0)}% (Target: {p.get('target_date', 'N/A')})\n"
        return {"query": query, "answer": answer, "matchedProjectIds": matched_ids, "engine": "Rule Engine"}

    # Default matching all projects
    return {
        "query": query,
        "answer": f"Processed query against {len(projects)} projects in database.",
        "matchedProjectIds": [p['id'] for p in projects],
        "engine": "Rule Engine"
    }
