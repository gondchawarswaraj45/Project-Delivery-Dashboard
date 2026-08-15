import { Customer, User, Project, Milestone, Task, Issue, Activity, ProjectDocument } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Rahul Deshmukh', initials: 'RD', role: 'Implementation Manager', team: 'Delivery Alpha', email: 'rahul.deshmukh@yantratech.in' },
  { id: 'u2', name: 'Priya Kulkarni', initials: 'PK', role: 'Technical Lead', team: 'Delivery Alpha', email: 'priya.kulkarni@yantratech.in' },
  { id: 'u3', name: 'Sanjay Pawar', initials: 'SP', role: 'Solutions Architect', team: 'Delivery Beta', email: 'sanjay.pawar@yantratech.in' },
  { id: 'u4', name: 'Anjali Joshi', initials: 'AJ', role: 'Project Manager', team: 'Delivery Beta', email: 'anjali.joshi@yantratech.in' },
  { id: 'u5', name: 'Vikram Shinde', initials: 'VS', role: 'Integration Specialist', team: 'Delivery Gamma', email: 'vikram.shinde@yantratech.in' },
  { id: 'u6', name: 'Pooja Bhosale', initials: 'PB', role: 'DevOps Lead', team: 'Infrastructure', email: 'pooja.bhosale@yantratech.in' },
  { id: 'u7', name: 'Omkar Patil', initials: 'OP', role: 'QA Lead', team: 'Quality Assurance', email: 'omkar.patil@yantratech.in' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Pune Robotics Pvt. Ltd.', industry: 'Robotics & Automation', contactName: 'Suresh Mahajan', email: 'suresh.mahajan@punerobotics.in' },
  { id: 'c2', name: 'Nashik Agro Systems', industry: 'Agri Supply Chain', contactName: 'Meena Shinde', email: 'meena.shinde@nashikagro.in' },
  { id: 'c3', name: 'Aurangabad Defense Tech', industry: 'Aerospace & Defense', contactName: 'Rajendra Gaikwad', email: 'r.gaikwad@aurangabaddefense.in' },
  { id: 'c4', name: 'Kolhapur Heavy Engineering', industry: 'Industrial Hardware', contactName: 'Savita Mane', email: 'savita.mane@kolhapurheavy.in' },
  { id: 'c5', name: 'Nagpur GeoSurvey Labs', industry: 'GIS & Spatial Tech', contactName: 'Tushar Wagh', email: 'tushar.wagh@nagpurgeo.in' },
  { id: 'c6', name: 'Solapur Fleet Services', industry: 'Fleet Logistics', contactName: 'Kavita Salunkhe', email: 'kavita.salunkhe@solapurfleet.in' },
  { id: 'c7', name: 'Mumbai CyberSecure Ltd.', industry: 'Cybersecurity', contactName: 'Nitin Kale', email: 'nitin.kale@mumbaisecure.in' },
  { id: 'c8', name: 'Sangli Precision Works', industry: 'Heavy Machinery', contactName: 'Deepak Jadhav', email: 'deepak.jadhav@sangliprecision.in' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    customerId: 'c1',
    name: 'Drone Fleet Deployment',
    description: 'Autonomous warehouse drone survey fleet deployment with live sensor feed telemetry integration.',
    status: 'ON_TRACK',
    startDate: '2026-08-01',
    targetDate: '2026-08-30',
    progress: 44, // 4 of 9 tasks completed = 44%
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u1', 'u2'],
    internalNotes: 'Customer API credentials pending for live telematics stream. Mock testing completed.',
    customerSummary: 'Milestone 1 (Discovery) completed. API configuration verified. Awaiting access credentials.',
  },

  {
    id: 'p2',
    customerId: 'c2',
    name: 'Warehouse Automation',
    description: 'AGV routing system & conveyor belt IoT telemetry stack setup across distribution hubs.',
    status: 'AT_RISK',
    startDate: '2026-07-15',
    targetDate: '2026-09-10',
    progress: 33, // 1 of 3 tasks completed = 33%
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u3'],
    internalNotes: 'Hardware delivery delayed at port. Network switch installation on standby.',
    customerSummary: 'Software telemetry module is operational. Hardware rack installation scheduled for next week.',
  },
  {
    id: 'p3',
    customerId: 'c3',
    name: 'Mission Control Setup',
    description: 'Multi-node telemetry monitoring interface and real-time mission alert engine.',
    status: 'BLOCKED',
    startDate: '2026-06-20',
    targetDate: '2026-08-25',
    progress: 0, // 0 of 2 tasks completed = 0%
    lastUpdated: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u4', 'u5'],
    internalNotes: 'Client security officer rejected OAuth scope configuration. Need escalation to account executive.',
    customerSummary: 'Security compliance review is currently undergoing authorization approval.',
  },
  {
    id: 'p4',
    customerId: 'c4',
    name: 'Robotics Integration',
    description: '6-axis robotic arm driver installation and safety interlock automation on assembly line.',
    status: 'ON_TRACK',
    startDate: '2026-07-01',
    targetDate: '2026-09-15',
    progress: 50, // 1 of 2 tasks completed = 50%
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u2', 'u6'],
    internalNotes: 'PLC ladder logic compiled cleanly. Commissioning scheduled for Wednesday.',
    customerSummary: 'Robot arm kinematics calibration completed. Safety interlock checks underway.',
  },
  {
    id: 'p5',
    customerId: 'c5',
    name: 'Autonomous Mapping',
    description: '3D Point Cloud mesh generation and spatial SLAM algorithm deployment.',
    status: 'ON_TRACK',
    startDate: '2026-08-05',
    targetDate: '2026-09-30',
    progress: 50, // 1 of 2 tasks completed = 50%
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u3', 'u7'],
    internalNotes: 'LiDAR calibration dataset received. Processing speed looks promising.',
    customerSummary: 'Initial terrain mapping models synthesized successfully.',
  },
  {
    id: 'p6',
    customerId: 'c6',
    name: 'Fleet Analytics Implementation',
    description: 'Real-time vehicle health diagnostics and predictive maintenance dashboard.',
    status: 'COMPLETED',
    startDate: '2026-05-10',
    targetDate: '2026-08-10',
    progress: 100, // 2 of 2 tasks completed = 100%
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u1', 'u4'],
    internalNotes: 'Final sign-off achieved. Client team fully onboarded and trained.',
    customerSummary: 'Project complete. Final handover documentation and admin access granted.',
  },
  {
    id: 'p7',
    customerId: 'c7',
    name: 'Security Configuration',
    description: 'Zero-trust IAM policy deployment and encrypted telemetry tunnel setup.',
    status: 'BLOCKED',
    startDate: '2026-06-01',
    targetDate: '2026-08-18',
    progress: 50, // 1 of 2 tasks completed = 50%
    lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u6'],
    internalNotes: 'Firewall rules rejected by client IT infra team. Waiting for network architecture clearance.',
    customerSummary: 'Firewall rule verification in progress with enterprise IT team.',
  },
  {
    id: 'p8',
    customerId: 'c8',
    name: 'Operator Training',
    description: 'Curriculum creation, VR simulation walkthroughs, and operator certification.',
    status: 'ON_TRACK',
    startDate: '2026-07-20',
    targetDate: '2026-09-05',
    progress: 50, // 1 of 2 tasks completed = 50%
    lastUpdated: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    ownerIds: ['u5', 'u7'],
    internalNotes: 'Module 1 & 2 video recordings finished. Quiz assessment engine live.',
    customerSummary: 'Training module materials prepared and distributed to initial pilot group.',
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  // Project 1 (Drone Fleet Deployment)
  { id: 'm1-1', projectId: 'p1', name: '1. Discovery & Design', orderIndex: 1, status: 'DONE' },
  { id: 'm1-2', projectId: 'p1', name: '2. Implementation', orderIndex: 2, status: 'IN_PROGRESS' },
  { id: 'm1-3', projectId: 'p1', name: '3. Deployment', orderIndex: 3, status: 'NOT_STARTED' },
  { id: 'm1-4', projectId: 'p1', name: '4. Training & Handover', orderIndex: 4, status: 'NOT_STARTED' },

  // Project 2 (Warehouse Automation)
  { id: 'm2-1', projectId: 'p2', name: '1. Requirement Gathering', orderIndex: 1, status: 'DONE' },
  { id: 'm2-2', projectId: 'p2', name: '2. Hardware Installation', orderIndex: 2, status: 'BLOCKED' },
  { id: 'm2-3', projectId: 'p2', name: '3. Telemetry Integration', orderIndex: 3, status: 'IN_PROGRESS' },
  { id: 'm2-4', projectId: 'p2', name: '4. Site Acceptance Test', orderIndex: 4, status: 'NOT_STARTED' },

  // Project 3 (Mission Control Setup)
  { id: 'm3-1', projectId: 'p3', name: '1. Security & Auth Architecture', orderIndex: 1, status: 'BLOCKED' },
  { id: 'm3-2', projectId: 'p3', name: '2. Dashboard UI Configuration', orderIndex: 2, status: 'IN_PROGRESS' },

  // Project 4 (Robotics Integration)
  { id: 'm4-1', projectId: 'p4', name: '1. Mechanical Setup', orderIndex: 1, status: 'DONE' },
  { id: 'm4-2', projectId: 'p4', name: '2. PLC & Driver Programming', orderIndex: 2, status: 'IN_PROGRESS' },
  { id: 'm4-3', projectId: 'p4', name: '3. Safety Validation', orderIndex: 3, status: 'NOT_STARTED' },

  // Project 5 (Autonomous Mapping)
  { id: 'm5-1', projectId: 'p5', name: '1. Data Ingestion Pipeline', orderIndex: 1, status: 'IN_PROGRESS' },
  { id: 'm5-2', projectId: 'p5', name: '2. Mesh Processing Engine', orderIndex: 2, status: 'NOT_STARTED' },

  // Project 6 (Fleet Analytics)
  { id: 'm6-1', projectId: 'p6', name: '1. Core Telemetry Engine', orderIndex: 1, status: 'DONE' },
  { id: 'm6-2', projectId: 'p6', name: '2. Handover & Go-Live', orderIndex: 2, status: 'DONE' },

  // Project 7 (Security Configuration)
  { id: 'm7-1', projectId: 'p7', name: '1. IAM Policy Matrix', orderIndex: 1, status: 'DONE' },
  { id: 'm7-2', projectId: 'p7', name: '2. Tunnel Configuration', orderIndex: 2, status: 'BLOCKED' },

  // Project 8 (Operator Training)
  { id: 'm8-1', projectId: 'p8', name: '1. Curriculum Development', orderIndex: 1, status: 'DONE' },
  { id: 'm8-2', projectId: 'p8', name: '2. Simulation Labs', orderIndex: 2, status: 'IN_PROGRESS' },
];

export const INITIAL_TASKS: Task[] = [
  // Project 1 Tasks (Drone Fleet Deployment) - 4 Done, 1 In Progress, 1 Blocked, 3 Not Started (4/9 = 44%)
  { id: 't1-1', milestoneId: 'm1-1', projectId: 'p1', title: 'Requirements gathering', customerFacingTitle: 'Requirements & Scope Finalization', ownerId: 'u1', status: 'DONE', priority: 'HIGH', dueDate: '2026-08-04' },
  { id: 't1-2', milestoneId: 'm1-1', projectId: 'p1', title: 'Customer approval signoff', customerFacingTitle: 'Architecture Approval Signoff', ownerId: 'u1', status: 'DONE', priority: 'MEDIUM', dueDate: '2026-08-07' },
  { id: 't1-3', milestoneId: 'm1-1', projectId: 'p1', title: 'Architecture review', customerFacingTitle: 'System Architecture Verification', ownerId: 'u2', status: 'DONE', priority: 'HIGH', dueDate: '2026-08-10' },

  { id: 't1-4', milestoneId: 'm1-2', projectId: 'p1', title: 'API configuration', customerFacingTitle: 'API Gateway Configuration', ownerId: 'u1', status: 'DONE', priority: 'HIGH', dueDate: '2026-08-12' },
  { id: 't1-5', milestoneId: 'm1-2', projectId: 'p1', title: 'Robot integration drivers', customerFacingTitle: 'Drone Fleet Telemetry Drivers', ownerId: 'u2', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-08-18' },
  {
    id: 't1-6',
    milestoneId: 'm1-2',
    projectId: 'p1',
    title: 'Mission dispatch setup',
    customerFacingTitle: 'Mission Dispatch & Fleet Routing',
    ownerId: 'u1',
    status: 'BLOCKED',
    priority: 'HIGH',
    dueDate: '2026-08-20',
    blocker: 'Customer has not provided API credentials. Escalate to account manager.',
    customerBlockerReason: 'Waiting for required access information.',
  },
  { id: 't1-7', milestoneId: 'm1-2', projectId: 'p1', title: 'Integration testing', customerFacingTitle: 'End-to-End Integration Testing', ownerId: 'u2', status: 'NOT_STARTED', priority: 'MEDIUM', dueDate: '2026-08-22' },

  { id: 't1-8', milestoneId: 'm1-3', projectId: 'p1', title: 'Production setup', customerFacingTitle: 'Production Environment Deployment', ownerId: 'u1', status: 'NOT_STARTED', priority: 'HIGH', dueDate: '2026-08-26' },
  { id: 't1-9', milestoneId: 'm1-3', projectId: 'p1', title: 'Site validation & handover', customerFacingTitle: 'Site Acceptance & Handover', ownerId: 'u2', status: 'NOT_STARTED', priority: 'HIGH', dueDate: '2026-08-28' },

  // Project 2 Tasks (Warehouse Automation)

  { id: 't2-1', milestoneId: 'm2-1', projectId: 'p2', title: 'Conveyor mapping spec', customerFacingTitle: 'Conveyor System Mapping Specification', ownerId: 'u3', status: 'DONE', priority: 'HIGH', dueDate: '2026-07-25' },
  {
    id: 't2-2',
    milestoneId: 'm2-2',
    projectId: 'p2',
    title: 'Install gateway routers',
    customerFacingTitle: 'Gateway Router & Hardware Installation',
    ownerId: 'u3',
    status: 'BLOCKED',
    priority: 'HIGH',
    dueDate: '2026-08-15',
    blocker: 'Custom mounting brackets delayed at customs. Hardware team on standby.',
    customerBlockerReason: 'Hardware shipment in transit; installation scheduled upon delivery.',
  },
  { id: 't2-3', milestoneId: 'm2-3', projectId: 'p2', title: 'IoT sensor daemon setup', customerFacingTitle: 'IoT Telemetry Daemon Setup', ownerId: 'u3', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-08-25' },

  // Project 3 Tasks (Mission Control Setup)
  {
    id: 't3-1',
    milestoneId: 'm3-1',
    projectId: 'p3',
    title: 'SSO OAuth scope approval',
    customerFacingTitle: 'Single Sign-On Security Authorization',
    ownerId: 'u4',
    status: 'BLOCKED',
    priority: 'HIGH',
    dueDate: '2026-08-10',
    blocker: 'Security clearance pending from client CISO. Account executive escalating.',
    customerBlockerReason: 'Security compliance review currently undergoing enterprise authorization approval.',
  },
  { id: 't3-2', milestoneId: 'm3-2', projectId: 'p3', title: 'Telemetry widget design', customerFacingTitle: 'Telemetry Dashboard Interface Design', ownerId: 'u5', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-08-20' },

  // Project 4 Tasks (Robotics Integration)
  { id: 't4-1', milestoneId: 'm4-1', projectId: 'p4', title: 'Arm mounting & leveling', customerFacingTitle: 'Robotic Arm Mechanical Assembly', ownerId: 'u6', status: 'DONE', priority: 'HIGH', dueDate: '2026-07-20' },
  { id: 't4-2', milestoneId: 'm4-2', projectId: 'p4', title: 'Kinematics library setup', customerFacingTitle: 'Kinematics & Motion Control Configuration', ownerId: 'u2', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-08-20' },

  // Project 5 Tasks (Autonomous Mapping)
  { id: 't5-1', milestoneId: 'm5-1', projectId: 'p5', title: 'Point Cloud parser module', customerFacingTitle: '3D Point Cloud Processing Module', ownerId: 'u3', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-08-25' },

  // Project 6 Tasks (Fleet Analytics)
  { id: 't6-1', milestoneId: 'm6-1', projectId: 'p6', title: 'Fleet status streaming engine', customerFacingTitle: 'Live Fleet Telemetry Streaming Service', ownerId: 'u1', status: 'DONE', priority: 'HIGH', dueDate: '2026-07-10' },

  // Project 7 Tasks (Security Configuration)
  {
    id: 't7-1',
    milestoneId: 'm7-2',
    projectId: 'p7',
    title: 'IPSec VPN tunnel config',
    customerFacingTitle: 'Secure IPSec Gateway Setup',
    ownerId: 'u6',
    status: 'BLOCKED',
    priority: 'HIGH',
    dueDate: '2026-08-05',
    blocker: 'Subnet collision with client internal network. Escalating to network admin.',
    customerBlockerReason: 'Network routing verification in progress with enterprise IT team.',
  },

  // Project 8 Tasks (Operator Training)
  { id: 't8-1', milestoneId: 'm8-2', projectId: 'p8', title: 'VR simulation lab setup', customerFacingTitle: 'Interactive VR Training Simulation Setup', ownerId: 'u5', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-08-28' },
];

export const INITIAL_ISSUES: Issue[] = [
  // Project 1 Issues
  {
    id: 'i1-1',
    projectId: 'p1',
    code: 'BUG-102',
    title: 'API authentication failing on staging environment',
    category: 'Bug',
    status: 'Open',
    priority: 'HIGH',
    ownerId: 'u1',
    internalOnly: true,
    description: 'Bearer token validation returns 401 due to clock skew on client reverse proxy.',
  },
  {
    id: 'i1-2',
    projectId: 'p1',
    code: 'IMP-204',
    title: 'Customer needs assistance configuring network connection',
    category: 'Implementation',
    status: 'In Progress',
    priority: 'MEDIUM',
    ownerId: 'u2',
    internalOnly: false,
    description: 'Subnet configuration for warehouse WiFi access points requires static lease reservation.',
  },
  {
    id: 'i1-3',
    projectId: 'p1',
    code: 'REQ-301',
    title: 'Support for custom LIDAR telemetry rate',
    category: 'Feature Request',
    status: 'Open',
    priority: 'LOW',
    ownerId: 'u2',
    internalOnly: false,
    description: 'Client requested 50Hz update option for high speed corridor scanning.',
  },

  // Project 2 Issues
  {
    id: 'i2-1',
    projectId: 'p2',
    code: 'BUG-201',
    title: 'Conveyor sensor packet loss over MQTT',
    category: 'Bug',
    status: 'In Progress',
    priority: 'HIGH',
    ownerId: 'u3',
    internalOnly: true,
    description: 'High EMI noise near main motor causing packet drop on unshielded RS-485 line.',
  },
  {
    id: 'i2-2',
    projectId: 'p2',
    code: 'SUP-105',
    title: 'Clarification on Emergency Stop relay wiring',
    category: 'Support',
    status: 'Open',
    priority: 'MEDIUM',
    ownerId: 'u3',
    internalOnly: false,
    description: 'On-site electricians requested schematic clarification for dual-channel safety relay.',
  },

  // Project 3 Issues
  {
    id: 'i3-1',
    projectId: 'p3',
    code: 'BUG-305',
    title: 'OAuth scope mismatch blocking mission control log-in',
    category: 'Bug',
    status: 'Open',
    priority: 'HIGH',
    ownerId: 'u4',
    internalOnly: true,
    description: 'Client Okta tenant rejecting offline_access scope parameter.',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'a1-1',
    projectId: 'p1',
    source: 'User',
    title: 'Task Updated',
    description: 'Rahul Deshmukh updated API Integration status: In Progress → Done',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: 'Rahul Deshmukh',
  },
  {
    id: 'a1-2',
    projectId: 'p1',
    source: 'AI',
    title: 'AI Update Processed',
    description: 'AI extracted status update from team email dispatch.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    author: 'AI System',
    rawText: "API integration is almost complete. We are waiting for the customer's credentials. UI testing is already finished and deployment should happen Friday.",
    changesApplied: true,
    structuredUpdate: {
      project_status: 'AT_RISK',
      updates: [
        { task: 'UI Testing', status: 'DONE' },
        { task: 'Mission dispatch setup', status: 'BLOCKED', blocker: 'Waiting for customer API credentials' },
      ],
      expected_completion: '2026-08-28',
      blocker_summary: 'Waiting for customer API credentials',
      customer_summary: 'UI Testing complete. Mission dispatch setup waiting on required access credentials.',
    },
  },
  {
    id: 'a1-3',
    projectId: 'p1',
    source: 'User',
    title: 'Milestone Completed',
    description: 'Priya Kulkarni completed Robot Configuration & Calibration',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: 'Priya Kulkarni',
  },
  {
    id: 'a1-4',
    projectId: 'p1',
    source: 'System',
    title: 'Project Status Shift',
    description: 'Project status changed: At Risk → On Track',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    author: 'System',
  },
  {
    id: 'a2-1',
    projectId: 'p2',
    source: 'User',
    title: 'Issue Flagged',
    description: 'Sanjay Pawar created BUG-201: Conveyor sensor packet loss',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Sanjay Pawar',
  },
];

export const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-1',
    projectId: 'p1',
    name: 'Drone Fleet Architecture & Deployment Guide.pdf',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    url: '#',
    visibleToCustomer: true,
    uploadedAt: '2026-08-02',
  },
  {
    id: 'doc-2',
    projectId: 'p1',
    name: 'Operator Training Manual v1.4.pdf',
    fileType: 'pdf',
    fileSize: '2.8 MB',
    url: '#',
    visibleToCustomer: true,
    uploadedAt: '2026-08-10',
  },
  {
    id: 'doc-3',
    projectId: 'p1',
    name: 'Internal Security Audit & Escrow Credentials.docx',
    fileType: 'doc',
    fileSize: '1.1 MB',
    url: '#',
    visibleToCustomer: false,
    uploadedAt: '2026-08-12',
  },
  {
    id: 'doc-4',
    projectId: 'p2',
    name: 'Warehouse PLC Telemetry Specification.pdf',
    fileType: 'pdf',
    fileSize: '3.5 MB',
    url: '#',
    visibleToCustomer: true,
    uploadedAt: '2026-07-20',
  },
];
