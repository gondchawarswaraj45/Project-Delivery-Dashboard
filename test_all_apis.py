import httpx

base = 'http://127.0.0.1:8000'
client = httpx.Client(base_url=base, timeout=10.0)

tests = []

# 1. Health
r = client.get('/api/health')
tests.append(('GET /api/health', r.status_code == 200, r.json()))

# 2. Root
r = client.get('/')
tests.append(('GET /', r.status_code == 200, r.json().get('status') == 'online'))

# 3. Projects
r = client.get('/api/projects')
projects = r.json()
tests.append(('GET /api/projects', r.status_code == 200 and len(projects) > 0, f'{len(projects)} projects loaded'))

# 4. Project Detail
r = client.get('/api/projects/p1')
tests.append(('GET /api/projects/p1', r.status_code == 200 and 'milestones' in r.json(), r.json().get('name')))

# 5. AI Update Ingestion
r = client.post('/api/projects/p1/ai-update', json={'raw_text': 'Drone drivers done. Mission dispatch blocked on customer tokens.'})
tests.append(('POST /api/projects/p1/ai-update', r.status_code == 200 and 'updates' in r.json(), f"Status: {r.json().get('project_status')}"))

# 6. Apply AI Update
r = client.post('/api/projects/p1/apply-update', json={
    'raw_text': 'Drone drivers done. Mission dispatch blocked on customer tokens.',
    'structured': {
        'project_status': 'AT_RISK',
        'updates': [{'task': 'Robot integration drivers', 'status': 'DONE', 'blocker': None}],
        'expected_completion': '2026-08-30',
        'customer_summary': 'Drone drivers tested and verified.'
    }
})
tests.append(('POST /api/projects/p1/apply-update', r.status_code == 200, r.json().get('message')))

# 7. Linear Webhook
r = client.post('/api/webhooks/linear', json={
    'action': 'update',
    'type': 'Issue',
    'data': {'id': 'lin-1', 'title': 'Telemetry verification', 'state': {'name': 'Done'}}
})
tests.append(('POST /api/webhooks/linear', r.status_code == 200, r.json().get('status')))

# 8. NL Query
r = client.post('/api/nl-query', json={'query': 'which projects are blocked?'})
tests.append(('POST /api/nl-query', r.status_code == 200 and 'answer' in r.json(), r.json().get('answer')[:45] + '...'))

# 9. Reset Demo
r = client.post('/api/reset-demo')
tests.append(('POST /api/reset-demo', r.status_code == 200, r.json().get('message')))

print('========================================')
print('        API TEST SUITE SUMMARY          ')
print('========================================')
all_passed = True
for name, passed, details in tests:
    status_str = 'PASS' if passed else 'FAIL'
    if not passed: 
        all_passed = False
    print(f'[{status_str}] {name:32} -> {details}')

print('========================================')
print('OVERALL API HEALTH:', 'ALL 9 APIS OPERATIONAL (100% PASS)' if all_passed else 'SOME FAILED')
print('========================================')
