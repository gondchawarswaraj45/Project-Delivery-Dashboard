import os
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from database import get_db_connection, init_db, seed_data
from ai_extractor import extract_structured_update
from nl_query import process_natural_language_query

app = FastAPI(title="Project Delivery Dashboard API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic Schemas
class AIUpdateRequest(BaseModel):
    raw_text: str

class ApplyUpdateRequest(BaseModel):
    raw_text: str
    structured: dict

class NLQueryRequest(BaseModel):
    query: str

class NewProjectRequest(BaseModel):
    name: str
    description: str
    customer_id: str
    target_date: str
    owner_ids: List[str]
    milestones: List[str]

@app.get("/")
def root_endpoint():
    return {
        "status": "online",
        "service": "Project Delivery Dashboard API",
        "version": "1.0.0",
        "interactive_docs": "http://127.0.0.1:8000/docs",
        "endpoints": {
            "health": "/api/health",
            "projects": "/api/projects",
            "project_detail": "/api/projects/{id}",
            "ai_unstructured_update": "/api/projects/{id}/ai-update",
            "apply_update": "/api/projects/{id}/apply-update",
            "linear_webhook": "/api/webhooks/linear",
            "natural_language_query": "/api/nl-query",
            "reset_demo_db": "/api/reset-demo"
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Project Delivery Dashboard Python FastAPI Backend"}

@app.get("/api/projects")
def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT p.*, c.name as customer_name, c.industry as customer_industry
        FROM projects p
        LEFT JOIN customers c ON p.customer_id = c.id
        ORDER BY p.last_updated DESC
    ''')
    projects_rows = cursor.fetchall()

    result = []
    for row in projects_rows:
        p = dict(row)
        # Fetch owners for this project
        cursor.execute('''
            SELECT u.id, u.name, u.initials, u.role, u.team, u.email
            FROM project_owners po
            JOIN users u ON po.user_id = u.id
            WHERE po.project_id = ?
        ''', (p['id'],))
        owners = [dict(o) for o in cursor.fetchall()]

        # Compute stale flag (> 7 days inactive)
        last_date = datetime.fromisoformat(p['last_updated'].replace('Z', ''))
        stale = (datetime.now() - last_date).days > 7

        result.append({
            "id": p['id'],
            "customerId": p['customer_id'],
            "customerName": p['customer_name'],
            "customerIndustry": p['customer_industry'],
            "name": p['name'],
            "description": p['description'],
            "status": p['status'],
            "startDate": p['start_date'],
            "targetDate": p['target_date'],
            "progress": p['progress'],
            "lastUpdated": p['last_updated'],
            "internalNotes": p['internal_notes'],
            "customerSummary": p['customer_summary'],
            "owners": owners,
            "ownerIds": [o['id'] for o in owners],
            "stale": stale
        })

    conn.close()
    return result

@app.get("/api/projects/{project_id}")
def get_project_detail(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    p = dict(p_row)

    # Format Project
    cursor.execute('''
        SELECT u.id, u.name, u.initials, u.role, u.team, u.email
        FROM project_owners po
        JOIN users u ON po.user_id = u.id
        WHERE po.project_id = ?
    ''', (project_id,))
    owners = [dict(o) for o in cursor.fetchall()]

    project_data = {
        "id": p['id'],
        "customerId": p['customer_id'],
        "name": p['name'],
        "description": p['description'],
        "status": p['status'],
        "startDate": p['start_date'],
        "targetDate": p['target_date'],
        "progress": p['progress'],
        "lastUpdated": p['last_updated'],
        "internalNotes": p['internal_notes'],
        "customerSummary": p['customer_summary'],
        "owners": owners,
        "ownerIds": [o['id'] for o in owners]
    }

    # Milestones
    cursor.execute('SELECT * FROM milestones WHERE project_id = ? ORDER BY order_index ASC', (project_id,))
    milestones = [
        {
            "id": m['id'],
            "projectId": m['project_id'],
            "name": m['name'],
            "orderIndex": m['order_index'],
            "status": m['status']
        }
        for m in cursor.fetchall()
    ]

    # Tasks
    cursor.execute('SELECT * FROM tasks WHERE project_id = ?', (project_id,))
    tasks = [
        {
            "id": t['id'],
            "milestoneId": t['milestone_id'],
            "projectId": t['project_id'],
            "title": t['title'],
            "ownerId": t['owner_id'],
            "status": t['status'],
            "priority": t['priority'],
            "dueDate": t['due_date'],
            "blocker": t['blocker']
        }
        for t in cursor.fetchall()
    ]

    # Issues
    cursor.execute('SELECT * FROM issues WHERE project_id = ?', (project_id,))
    issues = [
        {
            "id": i['id'],
            "projectId": i['project_id'],
            "code": i['code'],
            "title": i['title'],
            "category": i['category'],
            "status": i['status'],
            "priority": i['priority'],
            "ownerId": i['owner_id'],
            "internalOnly": bool(i['internal_only']),
            "description": i['description']
        }
        for i in cursor.fetchall()
    ]

    # Activities
    cursor.execute('SELECT * FROM activities WHERE project_id = ? ORDER BY timestamp DESC', (project_id,))
    activities = []
    for a in cursor.fetchall():
        act = {
            "id": a['id'],
            "projectId": a['project_id'],
            "source": a['source'],
            "title": a['title'],
            "description": a['description'],
            "timestamp": a['timestamp'],
            "author": a['author'],
            "rawText": a['raw_text'],
            "structuredUpdate": json.loads(a['structured_json']) if a['structured_json'] else None
        }
        activities.append(act)

    # Documents
    cursor.execute('SELECT * FROM documents WHERE project_id = ?', (project_id,))
    documents = [
        {
            "id": d['id'],
            "projectId": d['project_id'],
            "name": d['name'],
            "fileType": d['file_type'],
            "fileSize": d['file_size'],
            "url": d['url'],
            "visibleToCustomer": bool(d['visible_to_customer']),
            "uploadedAt": d['uploaded_at']
        }
        for d in cursor.fetchall()
    ]

    conn.close()
    return {
        "project": project_data,
        "milestones": milestones,
        "tasks": tasks,
        "issues": issues,
        "activities": activities,
        "documents": documents
    }

@app.post("/api/projects/{project_id}/ai-update")
def process_ai_update(project_id: str, req: AIUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    cursor.execute('SELECT * FROM tasks WHERE project_id = ?', (project_id,))
    tasks = [dict(t) for t in cursor.fetchall()]

    conn.close()

    result = extract_structured_update(req.raw_text, p_row['status'], p_row['target_date'], tasks)
    return result

@app.post("/api/projects/{project_id}/apply-update")
def apply_ai_update(project_id: str, req: ApplyUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    structured = req.structured
    now_iso = datetime.now().isoformat()

    # Update project
    cursor.execute('''
        UPDATE projects
        SET status = ?, target_date = ?, customer_summary = ?, internal_notes = ?, last_updated = ?
        WHERE id = ?
    ''', (
        structured.get('project_status', 'ON_TRACK'),
        structured.get('expected_completion'),
        structured.get('customer_summary'),
        f"AI Blocker: {structured.get('blocker_summary')}" if structured.get('blocker_summary') else "Update applied via AI",
        now_iso,
        project_id
    ))

    # Update tasks
    for up in structured.get('updates', []):
        task_name = up.get('task')
        status = up.get('status')
        blocker = up.get('blocker')

        cursor.execute('''
            UPDATE tasks
            SET status = ?, blocker = ?
            WHERE project_id = ? AND LOWER(title) = LOWER(?)
        ''', (status, blocker, project_id, task_name))

    # Recalculate progress %
    cursor.execute('SELECT COUNT(*) as total FROM tasks WHERE project_id = ?', (project_id,))
    total = cursor.fetchone()['total']
    if total > 0:
        cursor.execute("SELECT COUNT(*) as done FROM tasks WHERE project_id = ? AND status = 'DONE'", (project_id,))
        done = cursor.fetchone()['done']
        pct = int((done / total) * 100)
        cursor.execute('UPDATE projects SET progress = ? WHERE id = ?', (pct, project_id))

    # Detect communication channel for rich activity timeline logging
    raw_lower = req.raw_text.lower()
    source_tag = 'AI'
    if 'subject:' in raw_lower or 'from:' in raw_lower or '@' in raw_lower and '.in' in raw_lower:
        source_tag = 'Email'
    elif '@channel' in raw_lower or 'slack' in raw_lower or 'teams' in raw_lower or '#' in raw_lower:
        source_tag = 'Slack'
    elif 'transcript' in raw_lower or 'standup' in raw_lower or 'zoom' in raw_lower:
        source_tag = 'Call'

    # Record activity
    act_id = f"act-{int(datetime.now().timestamp()*1000)}"
    cursor.execute('''
        INSERT INTO activities (id, project_id, source, title, description, timestamp, author, raw_text, structured_json)
        VALUES (?, ?, ?, 'Status Update Synchronized', ?, ?, 'AI Ingestion Engine', ?, ?)
    ''', (
        act_id,
        project_id,
        source_tag,
        f"Status updated to {structured.get('project_status')}. {len(structured.get('updates', []))} task(s) updated.",
        now_iso,
        req.raw_text,
        json.dumps(structured)
    ))

    conn.commit()
    conn.close()
    return {"status": "success", "message": "Project update applied successfully!"}

@app.post("/api/nl-query")
def nl_query_endpoint(req: NLQueryRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM projects')
    projects = [dict(p) for p in cursor.fetchall()]

    cursor.execute('SELECT * FROM tasks')
    tasks = [dict(t) for t in cursor.fetchall()]

    cursor.execute('SELECT * FROM users')
    users = [dict(u) for u in cursor.fetchall()]

    conn.close()
    return process_natural_language_query(req.query, projects, tasks, users)

@app.post("/api/webhooks/linear")
def receive_linear_webhook(payload: dict):
    """
    Receives and processes incoming Linear Webhooks (Issues, Projects, Updates).
    Maps Linear Issue state changes to Dashboard Tasks and recalculates progress.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    action = payload.get("action", "update")
    event_type = payload.get("type", "Issue")
    data = payload.get("data", {})

    now_iso = datetime.now().isoformat()
    matched_task = None
    target_project_id = None

    if event_type == "Issue":
        issue_title = data.get("title", "")
        state_obj = data.get("state", {})
        state_name = state_obj.get("name", "").lower() if isinstance(state_obj, dict) else str(state_obj).lower()
        state_type = state_obj.get("type", "").lower() if isinstance(state_obj, dict) else ""

        # State mapping
        new_status = "IN_PROGRESS"
        if state_type == "completed" or "done" in state_name or "complete" in state_name:
            new_status = "DONE"
        elif state_type == "canceled" or "block" in state_name:
            new_status = "BLOCKED"
        elif state_type == "unstarted" or "backlog" in state_name or "todo" in state_name:
            new_status = "NOT_STARTED"
        elif state_type == "started" or "progress" in state_name or "in review" in state_name:
            new_status = "IN_PROGRESS"

        # Find matching task across projects
        cursor.execute("SELECT * FROM tasks")
        all_tasks = [dict(t) for t in cursor.fetchall()]

        for t in all_tasks:
            if t["title"].lower() in issue_title.lower() or issue_title.lower() in t["title"].lower():
                matched_task = t
                target_project_id = t["project_id"]
                break

        if not matched_task and all_tasks:
            # Fallback match first active task for demo testing
            matched_task = all_tasks[0]
            target_project_id = matched_task["project_id"]

        if matched_task:
            blocker_note = data.get("description", "Blocked by dependency in Linear") if new_status == "BLOCKED" else None
            cursor.execute(
                "UPDATE tasks SET status = ?, blocker = ? WHERE id = ?",
                (new_status, blocker_note, matched_task["id"])
            )

            # Recalculate project progress
            cursor.execute("SELECT COUNT(*) as total FROM tasks WHERE project_id = ?", (target_project_id,))
            total = cursor.fetchone()["total"]
            if total > 0:
                cursor.execute("SELECT COUNT(*) as done FROM tasks WHERE project_id = ? AND status = 'DONE'", (target_project_id,))
                done = cursor.fetchone()["done"]
                pct = int((done / total) * 100)
                cursor.execute("UPDATE projects SET progress = ?, last_updated = ? WHERE id = ?", (pct, now_iso, target_project_id))

            # Record Linear activity event
            act_id = f"act-linear-{int(datetime.now().timestamp()*1000)}"
            cursor.execute('''
                INSERT INTO activities (id, project_id, source, title, description, timestamp, author, raw_text, structured_json)
                VALUES (?, ?, 'Linear', ?, ?, ?, 'Linear Webhook Integration', ?, ?)
            ''', (
                act_id,
                target_project_id,
                f"Linear Event: {matched_task['title']}",
                f"Task status changed to {new_status} via Linear webhook event ({action})",
                now_iso,
                json.dumps(data),
                json.dumps({"source": "Linear", "event": event_type, "action": action, "status": new_status})
            ))

            conn.commit()

    conn.close()
    return {
        "status": "success",
        "processed_event": event_type,
        "action": action,
        "matched_task": matched_task["title"] if matched_task else None,
        "project_id": target_project_id
    }

class UpdateTaskRequest(BaseModel):
    status: Optional[str] = None
    blocker: Optional[str] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class CreateTaskRequest(BaseModel):
    milestone_id: str
    title: str
    owner_id: str
    status: str = 'NOT_STARTED'
    priority: str = 'MEDIUM'
    due_date: str = '2026-08-30'

class UpdateProjectRequest(BaseModel):
    status: Optional[str] = None
    target_date: Optional[str] = None
    customer_summary: Optional[str] = None
    internal_notes: Optional[str] = None

class CreateIssueRequest(BaseModel):
    title: str
    category: str
    priority: str
    owner_id: str
    internal_only: bool = False
    description: str = ''

@app.put("/api/tasks/{task_id}")
def update_task_endpoint(task_id: str, req: UpdateTaskRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
    t = cursor.fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    project_id = t['project_id']
    new_status = req.status or t['status']
    new_blocker = req.blocker if req.blocker is not None else t['blocker']
    new_title = req.title or t['title']
    new_priority = req.priority or t['priority']
    new_due = req.due_date or t['due_date']

    if new_status != 'BLOCKED':
        new_blocker = None

    cursor.execute('''
        UPDATE tasks
        SET status = ?, blocker = ?, title = ?, priority = ?, due_date = ?
        WHERE id = ?
    ''', (new_status, new_blocker, new_title, new_priority, new_due, task_id))

    # Recalculate progress % for project
    cursor.execute('SELECT COUNT(*) as total FROM tasks WHERE project_id = ?', (project_id,))
    total = cursor.fetchone()['total']
    if total > 0:
        cursor.execute("SELECT COUNT(*) as done FROM tasks WHERE project_id = ? AND status = 'DONE'", (project_id,))
        done = cursor.fetchone()['done']
        pct = int((done / total) * 100)
        cursor.execute('UPDATE projects SET progress = ?, last_updated = ? WHERE id = ?', (pct, datetime.now().isoformat(), project_id))

    # Log activity
    act_id = f"act-{int(datetime.now().timestamp()*1000)}"
    cursor.execute('''
        INSERT INTO activities (id, project_id, source, title, description, timestamp, author)
        VALUES (?, ?, 'User', ?, ?, ?, 'Delivery Team')
    ''', (
        act_id,
        project_id,
        f"Task Updated: {new_title}",
        f"Status changed to {new_status}" + (f" (Blocker: {new_blocker})" if new_blocker else ""),
        datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Task '{new_title}' updated to {new_status}"}

@app.post("/api/projects/{project_id}/tasks")
def create_task_endpoint(project_id: str, req: CreateTaskRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    task_id = f"t-{int(datetime.now().timestamp()*1000)}"
    cursor.execute('''
        INSERT INTO tasks (id, milestone_id, project_id, title, owner_id, status, priority, due_date, blocker)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    ''', (task_id, req.milestone_id, project_id, req.title, req.owner_id, req.status, req.priority, req.due_date))

    # Recalculate progress %
    cursor.execute('SELECT COUNT(*) as total FROM tasks WHERE project_id = ?', (project_id,))
    total = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as done FROM tasks WHERE project_id = ? AND status = 'DONE'", (project_id,))
    done = cursor.fetchone()['done']
    pct = int((done / total) * 100) if total > 0 else 0
    cursor.execute('UPDATE projects SET progress = ?, last_updated = ? WHERE id = ?', (pct, datetime.now().isoformat(), project_id))

    conn.commit()
    conn.close()
    return {"status": "success", "task_id": task_id, "message": f"Task '{req.title}' created successfully!"}

@app.put("/api/projects/{project_id}")
def update_project_endpoint(project_id: str, req: UpdateProjectRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    p = cursor.fetchone()
    if not p:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    new_status = req.status or p['status']
    new_target = req.target_date or p['target_date']
    new_summary = req.customer_summary if req.customer_summary is not None else p['customer_summary']
    new_notes = req.internal_notes if req.internal_notes is not None else p['internal_notes']

    cursor.execute('''
        UPDATE projects
        SET status = ?, target_date = ?, customer_summary = ?, internal_notes = ?, last_updated = ?
        WHERE id = ?
    ''', (new_status, new_target, new_summary, new_notes, datetime.now().isoformat(), project_id))

    conn.commit()
    conn.close()
    return {"status": "success", "message": "Project updated successfully!"}

@app.post("/api/projects/{project_id}/issues")
def create_issue_endpoint(project_id: str, req: CreateIssueRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) as total FROM issues WHERE project_id = ?', (project_id,))
    count = cursor.fetchone()['total'] + 1
    code = f"ISSUE-{count}"

    issue_id = f"iss-{int(datetime.now().timestamp()*1000)}"
    cursor.execute('''
        INSERT INTO issues (id, project_id, code, title, category, status, priority, owner_id, internal_only, description)
        VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?)
    ''', (issue_id, project_id, code, req.title, req.category, req.priority, req.owner_id, 1 if req.internal_only else 0, req.description))

    conn.commit()
    conn.close()
    return {"status": "success", "issue_id": issue_id, "code": code, "message": "Issue recorded successfully!"}

@app.post("/api/reset-demo")
def reset_demo():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executescript('''
        DELETE FROM activities;
        DELETE FROM documents;
        DELETE FROM issues;
        DELETE FROM tasks;
        DELETE FROM milestones;
        DELETE FROM project_owners;
        DELETE FROM projects;
        DELETE FROM customers;
        DELETE FROM users;
    ''')
    seed_data(cursor)
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Reset database to initial 8 synthetic demo projects!"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
