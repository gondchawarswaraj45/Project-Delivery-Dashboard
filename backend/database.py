import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'dashboard.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            initials TEXT NOT NULL,
            role TEXT NOT NULL,
            team TEXT NOT NULL,
            email TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            industry TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            email TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL,
            start_date TEXT NOT NULL,
            target_date TEXT NOT NULL,
            progress INTEGER NOT NULL,
            last_updated TEXT NOT NULL,
            internal_notes TEXT,
            customer_summary TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        );

        CREATE TABLE IF NOT EXISTS project_owners (
            project_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            PRIMARY KEY (project_id, user_id),
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            order_index INTEGER NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            milestone_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            due_date TEXT NOT NULL,
            blocker TEXT,
            FOREIGN KEY (milestone_id) REFERENCES milestones(id),
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS issues (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            internal_only INTEGER NOT NULL,
            description TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            source TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            author TEXT NOT NULL,
            raw_text TEXT,
            structured_json TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size TEXT,
            url TEXT NOT NULL,
            visible_to_customer INTEGER NOT NULL,
            uploaded_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        -- Performance & Foreign Key Indexes
        CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
        CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
        CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
        CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
        CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_owners ON project_owners(project_id, user_id);
    ''')

    # Seed data if projects table is empty
    cursor.execute('SELECT COUNT(*) FROM projects')
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)

    conn.commit()
    conn.close()

def reset_db():
    """Drop all data and re-seed — used by /api/reset-demo endpoint."""
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

def seed_data(cursor):
    now = datetime.now()
    two_hours_ago   = (now - timedelta(hours=2)).isoformat()
    three_days_ago  = (now - timedelta(days=3)).isoformat()
    nine_days_ago   = (now - timedelta(days=9)).isoformat()   # STALE
    twelve_days_ago = (now - timedelta(days=12)).isoformat()  # STALE

    # 1. Users (Marathi names in English script)
    users = [
        ('u1', 'Rahul Deshmukh',  'RD', 'Implementation Manager', 'Delivery Alpha',    'rahul.deshmukh@yantratech.in'),
        ('u2', 'Priya Kulkarni',  'PK', 'Technical Lead',         'Delivery Alpha',    'priya.kulkarni@yantratech.in'),
        ('u3', 'Sanjay Pawar',    'SP', 'Solutions Architect',    'Delivery Beta',     'sanjay.pawar@yantratech.in'),
        ('u4', 'Anjali Joshi',    'AJ', 'Project Manager',        'Delivery Beta',     'anjali.joshi@yantratech.in'),
        ('u5', 'Vikram Shinde',   'VS', 'Integration Specialist', 'Delivery Gamma',    'vikram.shinde@yantratech.in'),
        ('u6', 'Pooja Bhosale',   'PB', 'DevOps Lead',            'Infrastructure',    'pooja.bhosale@yantratech.in'),
        ('u7', 'Omkar Patil',     'OP', 'QA Lead',                'Quality Assurance', 'omkar.patil@yantratech.in'),
    ]
    cursor.executemany('INSERT INTO users VALUES (?,?,?,?,?,?)', users)

    # 2. Customers (Maharashtra / Marathi companies in English script)
    customers = [
        ('c1', 'Pune Robotics Pvt. Ltd.',     'Robotics & Automation', 'Suresh Mahajan',   'suresh.mahajan@punerobotics.in'),
        ('c2', 'Nashik Agro Systems',          'Agri Supply Chain',     'Meena Shinde',     'meena.shinde@nashikagro.in'),
        ('c3', 'Aurangabad Defense Tech',      'Aerospace & Defense',   'Rajendra Gaikwad', 'r.gaikwad@aurangabaddefense.in'),
        ('c4', 'Kolhapur Heavy Engineering',   'Industrial Hardware',   'Savita Mane',      'savita.mane@kolhapurheavy.in'),
        ('c5', 'Nagpur GeoSurvey Labs',        'GIS & Spatial Tech',    'Tushar Wagh',      'tushar.wagh@nagpurgeo.in'),
        ('c6', 'Solapur Fleet Services',       'Fleet Logistics',       'Kavita Salunkhe',  'kavita.salunkhe@solapurfleet.in'),
        ('c7', 'Mumbai CyberSecure Ltd.',      'Cybersecurity',         'Nitin Kale',       'nitin.kale@mumbaisecure.in'),
        ('c8', 'Sangli Precision Works',       'Heavy Machinery',       'Deepak Jadhav',    'deepak.jadhav@sangliprecision.in'),
    ]
    cursor.executemany('INSERT INTO customers VALUES (?,?,?,?,?)', customers)

    # 3. Projects (English titles & descriptions)
    projects = [
        ('p1', 'c1',
         'Drone Fleet Deployment',
         'Autonomous warehouse drone survey fleet deployment with live sensor feed telemetry integration.',
         'ON_TRACK', '2026-08-01', '2026-08-30', 44, two_hours_ago,
         'Customer API credentials pending for live telematics stream, but mock testing is completed.',
         'Integration testing is in progress. Drone navigation & waypoint dispatch systems verified.'),

        ('p2', 'c2',
         'Warehouse Automation',
         'AGV routing system & conveyor belt IoT telemetry stack setup across distribution hubs.',
         'AT_RISK', '2026-07-15', '2026-09-10', 48, three_days_ago,
         'Hardware delivery delayed at port. Network switch installation on standby.',
         'Software telemetry module is operational. Hardware rack installation scheduled for next week.'),
        ('p3', 'c3',
         'Mission Control Setup',
         'Multi-node telemetry monitoring interface and real-time mission alert engine.',
         'BLOCKED', '2026-06-20', '2026-08-25', 31, nine_days_ago,
         'Client security officer rejected OAuth scope configuration. Need escalation to account executive.',
         'Security compliance review is currently undergoing authorization approval.'),
        ('p4', 'c4',
         'Robotics Integration',
         '6-axis robotic arm driver installation and safety interlock automation on assembly line.',
         'ON_TRACK', '2026-07-01', '2026-09-15', 64, two_hours_ago,
         'PLC ladder logic compiled cleanly. Commissioning scheduled for Wednesday.',
         'Robot arm kinematics calibration completed. Safety interlock checks underway.'),
        ('p5', 'c5',
         'Autonomous Mapping',
         '3D Point Cloud mesh generation and spatial SLAM algorithm deployment.',
         'ON_TRACK', '2026-08-05', '2026-09-30', 25, two_hours_ago,
         'LiDAR calibration dataset received. Processing speed looks promising.',
         'Initial terrain mapping models synthesized successfully.'),
        ('p6', 'c6',
         'Fleet Analytics Implementation',
         'Real-time vehicle health diagnostics and predictive maintenance dashboard.',
         'COMPLETED', '2026-05-10', '2026-08-10', 100, three_days_ago,
         'Final sign-off achieved. Client team fully onboarded and trained.',
         'Project complete. Final handover documentation and admin access granted.'),
        ('p7', 'c7',
         'Security Configuration',
         'Zero-trust IAM policy deployment and encrypted telemetry tunnel setup.',
         'BLOCKED', '2026-06-01', '2026-08-18', 40, twelve_days_ago,
         'Firewall rules rejected by client IT infra team. Waiting for network architecture clearance.',
         'Firewall rule verification in progress with enterprise IT team.'),
        ('p8', 'c8',
         'Operator Training',
         'Curriculum creation, VR simulation walkthroughs, and operator certification.',
         'ON_TRACK', '2026-07-20', '2026-09-05', 55, two_hours_ago,
         'Module 1 & 2 video recordings finished. Quiz assessment engine live.',
         'Training module materials prepared and distributed to initial pilot group.'),
    ]
    cursor.executemany('INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?)', projects)

    # 4. Project Owners
    owners = [
        ('p1', 'u1'), ('p1', 'u2'),
        ('p2', 'u3'),
        ('p3', 'u4'), ('p3', 'u5'),
        ('p4', 'u2'), ('p4', 'u6'),
        ('p5', 'u3'), ('p5', 'u7'),
        ('p6', 'u1'), ('p6', 'u4'),
        ('p7', 'u6'),
        ('p8', 'u5'), ('p8', 'u7'),
    ]
    cursor.executemany('INSERT INTO project_owners VALUES (?,?)', owners)

    # 5. Milestones
    milestones = [
        ('m1-1', 'p1', '1. Discovery & Design', 1, 'DONE'),
        ('m1-2', 'p1', '2. Implementation', 2, 'IN_PROGRESS'),
        ('m1-3', 'p1', '3. Deployment', 3, 'NOT_STARTED'),
        ('m1-4', 'p1', '4. Training & Handover', 4, 'NOT_STARTED'),
        ('m2-1', 'p2', '1. Requirement Gathering', 1, 'DONE'),
        ('m2-2', 'p2', '2. Hardware Installation', 2, 'BLOCKED'),
        ('m2-3', 'p2', '3. Telemetry Integration', 3, 'IN_PROGRESS'),
        ('m2-4', 'p2', '4. Site Acceptance Test', 4, 'NOT_STARTED'),
        ('m3-1', 'p3', '1. Security & Auth Architecture', 1, 'BLOCKED'),
        ('m3-2', 'p3', '2. Dashboard UI Configuration', 2, 'IN_PROGRESS'),
        ('m4-1', 'p4', '1. Mechanical Setup', 1, 'DONE'),
        ('m4-2', 'p4', '2. PLC & Driver Programming', 2, 'IN_PROGRESS'),
        ('m4-3', 'p4', '3. Safety Validation', 3, 'NOT_STARTED'),
        ('m5-1', 'p5', '1. Data Ingestion Pipeline', 1, 'IN_PROGRESS'),
        ('m5-2', 'p5', '2. Mesh Processing Engine', 2, 'NOT_STARTED'),
        ('m6-1', 'p6', '1. Core Telemetry Engine', 1, 'DONE'),
        ('m6-2', 'p6', '2. Handover & Go-Live', 2, 'DONE'),
        ('m7-1', 'p7', '1. IAM Policy Matrix', 1, 'DONE'),
        ('m7-2', 'p7', '2. Tunnel Configuration', 2, 'BLOCKED'),
        ('m8-1', 'p8', '1. Curriculum Development', 1, 'DONE'),
        ('m8-2', 'p8', '2. Simulation Labs', 2, 'IN_PROGRESS'),
    ]
    cursor.executemany('INSERT INTO milestones VALUES (?,?,?,?,?)', milestones)

    # 6. Tasks
    tasks = [
        ('t1-1', 'm1-1', 'p1', 'Requirements gathering', 'u1', 'DONE', 'HIGH', '2026-08-04', None),
        ('t1-2', 'm1-1', 'p1', 'Customer approval signoff', 'u1', 'DONE', 'MEDIUM', '2026-08-07', None),
        ('t1-3', 'm1-1', 'p1', 'Architecture review', 'u2', 'DONE', 'HIGH', '2026-08-10', None),
        ('t1-4', 'm1-2', 'p1', 'API configuration', 'u1', 'DONE', 'HIGH', '2026-08-12', None),
        ('t1-5', 'm1-2', 'p1', 'Robot integration drivers', 'u2', 'IN_PROGRESS', 'HIGH', '2026-08-18', None),
        ('t1-6', 'm1-2', 'p1', 'Mission dispatch setup', 'u1', 'BLOCKED', 'HIGH', '2026-08-20', 'Customer has not provided API credentials. Escalate to account manager.'),
        ('t1-7', 'm1-2', 'p1', 'Integration testing', 'u2', 'NOT_STARTED', 'MEDIUM', '2026-08-22', None),
        ('t1-8', 'm1-3', 'p1', 'Production setup', 'u1', 'NOT_STARTED', 'HIGH', '2026-08-26', None),
        ('t1-9', 'm1-3', 'p1', 'Site validation', 'u2', 'NOT_STARTED', 'HIGH', '2026-08-28', None),
        ('t2-1', 'm2-1', 'p2', 'Conveyor mapping spec', 'u3', 'DONE', 'HIGH', '2026-07-25', None),
        ('t2-2', 'm2-2', 'p2', 'Install gateway routers', 'u3', 'BLOCKED', 'HIGH', '2026-08-15', 'Custom mounting brackets delayed at customs. Hardware team on standby.'),
        ('t2-3', 'm2-3', 'p2', 'IoT sensor daemon setup', 'u3', 'IN_PROGRESS', 'MEDIUM', '2026-08-25', None),
        ('t3-1', 'm3-1', 'p3', 'SSO OAuth scope approval', 'u4', 'BLOCKED', 'HIGH', '2026-08-10', 'Security clearance pending from Aurangabad Defense Tech CISO. Account executive escalating.'),
        ('t3-2', 'm3-2', 'p3', 'Telemetry widget design', 'u5', 'IN_PROGRESS', 'MEDIUM', '2026-08-20', None),
        ('t4-1', 'm4-1', 'p4', 'Arm mounting & leveling', 'u6', 'DONE', 'HIGH', '2026-07-20', None),
        ('t4-2', 'm4-2', 'p4', 'Kinematics library setup', 'u2', 'IN_PROGRESS', 'HIGH', '2026-08-20', None),
        ('t5-1', 'm5-1', 'p5', 'Point Cloud parser module', 'u3', 'IN_PROGRESS', 'HIGH', '2026-08-25', None),
        ('t6-1', 'm6-1', 'p6', 'Fleet status streaming engine', 'u1', 'DONE', 'HIGH', '2026-07-10', None),
        ('t7-1', 'm7-2', 'p7', 'IPSec VPN tunnel config', 'u6', 'BLOCKED', 'HIGH', '2026-08-05', 'Subnet collision with client internal network. Escalating to network admin.'),
        ('t8-1', 'm8-2', 'p8', 'VR simulation lab setup', 'u5', 'IN_PROGRESS', 'MEDIUM', '2026-08-28', None),
    ]
    cursor.executemany('INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?)', tasks)

    # 7. Issues
    issues = [
        ('i1-1', 'p1', 'BUG-102', 'API authentication failing on staging environment', 'Bug', 'Open', 'HIGH', 'u1', 1, 'Bearer token validation returns 401 due to clock skew on client reverse proxy.'),
        ('i1-2', 'p1', 'IMP-204', 'Customer needs assistance configuring network connection', 'Implementation', 'In Progress', 'MEDIUM', 'u2', 0, 'Subnet configuration for warehouse WiFi access points requires static lease reservation.'),
        ('i1-3', 'p1', 'REQ-301', 'Support for custom LIDAR telemetry rate', 'Feature Request', 'Open', 'LOW', 'u2', 0, 'Client requested 50Hz update option for high speed corridor scanning.'),
        ('i2-1', 'p2', 'BUG-201', 'Conveyor sensor packet loss over MQTT', 'Bug', 'In Progress', 'HIGH', 'u3', 1, 'High EMI noise near main motor causing packet drop on unshielded RS-485 line.'),
        ('i2-2', 'p2', 'SUP-105', 'Clarification on Emergency Stop relay wiring', 'Support', 'Open', 'MEDIUM', 'u3', 0, 'On-site electricians requested schematic clarification for dual-channel safety relay.'),
        ('i3-1', 'p3', 'BUG-305', 'OAuth scope mismatch blocking mission control log-in', 'Bug', 'Open', 'HIGH', 'u4', 1, 'Client Okta tenant rejecting offline_access scope parameter.'),
    ]
    cursor.executemany('INSERT INTO issues VALUES (?,?,?,?,?,?,?,?,?,?)', issues)

    # 8. Documents
    documents = [
        ('doc-1', 'p1', 'Drone Fleet Architecture & Deployment Guide.pdf', 'pdf', '4.2 MB', '#', 1, '2026-08-02'),
        ('doc-2', 'p1', 'Operator Training Manual v1.4.pdf', 'pdf', '2.8 MB', '#', 1, '2026-08-10'),
        ('doc-3', 'p1', 'Internal Security Audit & Escrow Credentials.docx', 'doc', '1.1 MB', '#', 0, '2026-08-12'),
        ('doc-4', 'p2', 'Warehouse PLC Telemetry Specification.pdf', 'pdf', '3.5 MB', '#', 1, '2026-07-20'),
    ]
    cursor.executemany('INSERT INTO documents VALUES (?,?,?,?,?,?,?,?)', documents)

    # 9. Activities
    activities = [
        ('act-1', 'p1', 'User', 'Task Updated',
         'Rahul Deshmukh updated API Integration status: In Progress → Done',
         two_hours_ago, 'Rahul Deshmukh', None, None),
        ('act-2', 'p1', 'AI', 'AI Update Processed',
         'AI extracted status update from team email dispatch.',
         two_hours_ago, 'AI System',
         "API integration is almost complete. We are waiting for the customer's credentials. UI testing is already finished and deployment should happen Friday.",
         json.dumps({'project_status': 'AT_RISK',
                     'updates': [{'task': 'Mission dispatch setup', 'status': 'BLOCKED', 'blocker': 'Waiting for customer API credentials'}],
                     'expected_completion': '2026-08-28',
                     'blocker_summary': 'Waiting for customer API credentials'})),
        ('act-3', 'p1', 'User', 'Milestone Completed',
         'Priya Kulkarni completed Robot Configuration & Calibration',
         three_days_ago, 'Priya Kulkarni', None, None),
        ('act-4', 'p2', 'User', 'Issue Flagged',
         'Sanjay Pawar created BUG-201: Conveyor sensor packet loss',
         three_days_ago, 'Sanjay Pawar', None, None),
    ]
    cursor.executemany('INSERT INTO activities VALUES (?,?,?,?,?,?,?,?,?)', activities)

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully with Marathi names in English script!")
