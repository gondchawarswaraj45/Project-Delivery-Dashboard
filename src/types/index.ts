export type ProjectStatus = 'ON_TRACK' | 'AT_RISK' | 'BLOCKED' | 'COMPLETED';

export type TaskStatus = 'DONE' | 'IN_PROGRESS' | 'BLOCKED' | 'NOT_STARTED';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type IssueCategory = 'Bug' | 'Feature Request' | 'Question' | 'Support' | 'Implementation';

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  role: string;
  team: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  contactName: string;
  email: string;
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string; // ISO format or YYYY-MM-DD
  targetDate: string;
  progress: number; // 0 - 100
  lastUpdated: string; // ISO string
  ownerIds: string[];
  internalNotes?: string;
  customerSummary?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  orderIndex: number;
  status: TaskStatus;
}

export interface Task {
  id: string;
  milestoneId: string;
  projectId: string;
  title: string;
  ownerId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  blocker?: string; // Internal blocker details (e.g. "Customer has not provided API credentials. Escalate to account manager.")
  customerBlockerReason?: string; // Customer-safe explanation (e.g. "Waiting for required access information.")
  customerFacingTitle?: string;
}

export interface Issue {
  id: string;
  projectId: string;
  code: string; // e.g. "BUG-102" or "IMP-204"
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: TaskPriority;
  ownerId: string;
  internalOnly: boolean;
  description?: string;
  resolution?: string;
}

export type ViewMode = 'internal' | 'customer';

export interface StructuredUpdate {
  project_status?: ProjectStatus;
  updates?: Array<{
    task: string;
    task_title?: string;
    status: TaskStatus;
    blocker?: string;
  }>;
  expected_completion?: string;
  blocker_summary?: string;
  blockers?: string[];
  customer_summary?: string;
  confidence?: number;
  reasoning?: string;
  engine?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  rawText?: string;
  source: 'AI' | 'User' | 'System' | 'Linear' | 'Email' | 'Slack' | 'Call';
  title: string;
  description: string;
  timestamp: string;
  author: string;
  changesApplied?: boolean;
  structuredUpdate?: StructuredUpdate;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'link';
  fileSize?: string;
  url: string;
  visibleToCustomer: boolean;
  uploadedAt: string;
}

export interface NaturalLanguageQueryResult {
  query: string;
  answer: string;
  matchedProjectIds: string[];
  engine?: string;
}

