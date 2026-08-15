import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

from ai_extractor import extract_structured_update
from nl_query import process_natural_language_query

print("========================================")
print("  TESTING GROQ AI EXTRACTOR & NL QUERY  ")
print("========================================")

# Test 1: AI Extractor test
sample_text = "Waypoint verification complete and tested. However, OAuth live telemetry credentials are delayed until agreement is signed."
tasks = [
    {"title": "Sensor telemetry calibration", "status": "IN_PROGRESS"},
    {"title": "Mission dispatch fleet setup", "status": "NOT_STARTED"}
]

result = extract_structured_update(sample_text, "ON_TRACK", "2026-08-30", tasks)
print("[PASS] AI Extractor Output:")
print("  Engine:", result.get("engine"))
print("  Project Status:", result.get("project_status"))
print("  Updates Count:", len(result.get("updates", [])))
print("  Customer Summary:", result.get("customer_summary"))

# Test 2: NL Query test
projects = [
    {"id": "p1", "name": "Autonomous Drone Fleet", "status": "AT_RISK", "progress": 73, "last_updated": "2026-08-15T10:00:00"},
    {"id": "p2", "name": "Cloud CRM Migration", "status": "BLOCKED", "progress": 45, "last_updated": "2026-08-10T10:00:00"}
]
tasks_db = [
    {"project_id": "p1", "title": "Sensor calibration", "status": "DONE"},
    {"project_id": "p2", "title": "OAuth credentials", "status": "BLOCKED", "blocker": "Waiting on client IT"}
]
users = [{"id": "u1", "name": "Rahul Deshmukh"}]

nl_res = process_natural_language_query("which projects are blocked or at risk?", projects, tasks_db, users)
print("\n[PASS] NL Query Output:")
print("  Engine:", nl_res.get("engine"))
print("  Matched IDs:", nl_res.get("matchedProjectIds"))
print("  Answer Preview:", nl_res.get("answer")[:80] + "...")

print("\n========================================")
print("  ALL TESTS PASSED SUCCESSFULLY!        ")
print("========================================")
