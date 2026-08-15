import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Customer,
  User,
  Milestone,
  Task,
  Issue,
  Activity,
  ProjectDocument,
  ProjectStatus,
  TaskStatus,
  StructuredUpdate,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_CUSTOMERS,
  INITIAL_USERS,
  INITIAL_MILESTONES,
  INITIAL_TASKS,
  INITIAL_ISSUES,
  INITIAL_ACTIVITIES,
  INITIAL_DOCUMENTS,
} from '../data/initialData';

export type ViewMode = 'internal' | 'customer';

import { API_BASE_URL } from '../utils/apiConfig';


interface ProjectContextType {
  projects: Project[];
  customers: Customer[];
  users: User[];
  milestones: Milestone[];
  tasks: Task[];
  issues: Issue[];
  activities: Activity[];
  documents: ProjectDocument[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isBackendConnected: boolean;
  
  // Actions
  applyAIUpdate: (projectId: string, structured: StructuredUpdate, rawText: string) => Promise<void>;
  triggerLinearWebhook: (taskTitle: string, newStatus: TaskStatus, blockerNote?: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus, blocker?: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  addIssue: (issue: Omit<Issue, 'id'>) => void;
  toggleDocumentVisibility: (docId: string) => void;
  resetToDemoData: () => Promise<void>;
  addNewProject: (newProj: Partial<Project>, milestones: string[], owners: string[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('internal');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [documents, setDocuments] = useState<ProjectDocument[]>(INITIAL_DOCUMENTS);

  // Fetch projects from Python FastAPI backend if server is active
  const fetchBackendProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        setIsBackendConnected(true);
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchBackendProjects();
  }, []);

  // When selected project changes, load full relational graph from backend
  useEffect(() => {
    if (!selectedProjectId) return;

    const loadDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects/${selectedProjectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.milestones && data.milestones.length > 0) {
            setMilestones((prev) => [
              ...prev.filter((m) => m.projectId !== selectedProjectId),
              ...data.milestones,
            ]);
          }
          if (data.tasks && data.tasks.length > 0) {
            setTasks((prev) => [
              ...prev.filter((t) => t.projectId !== selectedProjectId),
              ...data.tasks,
            ]);
          }
          if (data.issues && data.issues.length > 0) {
            setIssues((prev) => [
              ...prev.filter((i) => i.projectId !== selectedProjectId),
              ...data.issues,
            ]);
          }
          if (data.activities && data.activities.length > 0) {
            setActivities((prev) => [
              ...prev.filter((a) => a.projectId !== selectedProjectId),
              ...data.activities,
            ]);
          }
          if (data.documents && data.documents.length > 0) {
            setDocuments((prev) => [
              ...prev.filter((d) => d.projectId !== selectedProjectId),
              ...data.documents,
            ]);
          }
        }
      } catch {
        // Fallback to local state
      }
    };


    loadDetail();
  }, [selectedProjectId]);

  // Recalculate project progress
  const recalculateProgress = (projId: string, currentTasks: Task[]) => {
    const projectTasks = currentTasks.filter((t) => t.projectId === projId);
    if (projectTasks.length === 0) return;
    const completed = projectTasks.filter((t) => t.status === 'DONE').length;
    const progressPct = Math.round((completed / projectTasks.length) * 100);

    setProjects((prev) =>
      prev.map((p) => (p.id === projId ? { ...p, progress: progressPct, lastUpdated: new Date().toISOString() } : p))
    );
  };

  // Apply AI Update with immediate reactive state update and backend persistence
  const applyAIUpdate = async (projectId: string, structured: StructuredUpdate, rawText: string) => {
    // 1. Detect Source Channel
    const rawLower = rawText.toLowerCase();
    let sourceChannel: 'AI' | 'User' | 'System' | 'Linear' | 'Email' | 'Slack' | 'Call' = 'AI';
    if (rawLower.includes('subject:') || rawLower.includes('from:') || (rawLower.includes('@') && rawLower.includes('.in'))) {
      sourceChannel = 'Email';
    } else if (rawLower.includes('@channel') || rawLower.includes('slack') || rawLower.includes('#') || rawLower.includes('teams')) {
      sourceChannel = 'Slack';
    } else if (rawLower.includes('transcript') || rawLower.includes('zoom') || rawLower.includes('standup') || rawLower.includes('call')) {
      sourceChannel = 'Call';
    }


    const currentProj = projects.find((p) => p.id === projectId);
    const oldStatus = currentProj?.status || 'ON_TRACK';
    const newStatus = structured.project_status || oldStatus;

    // 2. Immediately update local React Project state
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          status: newStatus,
          targetDate: structured.expected_completion || p.targetDate,
          customerSummary: structured.customer_summary || p.customerSummary,
          internalNotes: structured.blocker_summary
            ? `AI Identified Blocker: ${structured.blocker_summary}`
            : p.internalNotes,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    // 3. Immediately update matching tasks
    const taskChangeDetails: string[] = [];

    if (structured.updates && structured.updates.length > 0) {
      setTasks((prevTasks) => {
        const updated = prevTasks.map((t) => {
          if (t.projectId !== projectId) return t;
          const match = structured.updates?.find(
            (u) =>
              u.task.toLowerCase().trim() === t.title.toLowerCase().trim() ||
              t.title.toLowerCase().includes(u.task.toLowerCase()) ||
              u.task.toLowerCase().includes(t.title.toLowerCase())
          );
          if (match) {
            taskChangeDetails.push(`${t.title}: ${t.status.replace('_', ' ')} → ${match.status.replace('_', ' ')}`);
            return {
              ...t,
              status: match.status,
              blocker: match.blocker || (match.status === 'BLOCKED' ? structured.blocker_summary || 'Blocked on dependency' : undefined),
              customerBlockerReason: match.status === 'BLOCKED' ? (structured.customer_summary || 'Waiting for required access information.') : undefined,
            };
          }
          return t;
        });
        recalculateProgress(projectId, updated);
        return updated;
      });
    }

    // 4. Create Rich Audit Activity Logs
    const nowIso = new Date().toISOString();
    const newActivities: Activity[] = [];

    // Audit Event 1: AI Update Processed
    const descText = taskChangeDetails.length > 0
      ? taskChangeDetails.join(' • ')
      : `AI parsed message. Health projected at ${newStatus.replace('_', ' ')}.`;

    newActivities.push({
      id: `act-${Date.now()}-1`,
      projectId,
      source: sourceChannel,
      title: `🤖 AI Update Processed (Source: ${sourceChannel === 'Email' ? 'Customer Email' : sourceChannel === 'Slack' ? 'Slack / Teams' : sourceChannel === 'Call' ? 'Call Transcript' : 'Direct Message'})`,
      description: descText,
      timestamp: nowIso,
      author: 'AI Ingestion Engine',
      rawText,
      changesApplied: true,
      structuredUpdate: structured,
    });

    // Audit Event 2: Project Status Changed (if status transitioned)
    if (newStatus !== oldStatus) {
      newActivities.push({
        id: `act-${Date.now()}-2`,
        projectId,
        source: 'AI',
        title: `📊 Project Status Changed: ${oldStatus.replace('_', ' ')} → ${newStatus.replace('_', ' ')}`,
        description: structured.blocker_summary
          ? `Reason: New blocker detected by AI — ${structured.blocker_summary}`
          : `Reason: AI analysis updated project delivery risk posture.`,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        author: 'AI Ingestion Engine',
        changesApplied: true,
      });
    }

    setActivities((prev) => [...newActivities, ...prev]);

    // 5. Send to Python FastAPI backend
    try {
      await fetch(`${API_BASE_URL}/projects/${projectId}/apply-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText, structured }),
      });
    } catch {
      // Local state is already updated seamlessly
    }
  };



  // Trigger Linear Webhook (Real FastAPI backend or local React state fallback)
  const triggerLinearWebhook = async (taskTitle: string, newStatus: TaskStatus, blockerNote?: string) => {
    const payload = {
      action: 'update',
      type: 'Issue',
      data: {
        title: taskTitle,
        state: {
          name: newStatus === 'DONE' ? 'Done' : newStatus === 'BLOCKED' ? 'Blocked' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Todo',
          type: newStatus === 'DONE' ? 'completed' : newStatus === 'BLOCKED' ? 'canceled' : newStatus === 'IN_PROGRESS' ? 'started' : 'unstarted',
        },
        description: blockerNote || (newStatus === 'BLOCKED' ? 'Blocked on API credentials in Linear' : undefined),
      },
    };

    try {
      await fetch(`${API_BASE_URL}/webhooks/linear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await fetchBackendProjects();
    } catch {
      // Local fallback for offline demo

      let targetProjectId = '';
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.title.toLowerCase().includes(taskTitle.toLowerCase()) || taskTitle.toLowerCase().includes(t.title.toLowerCase())) {
            targetProjectId = t.projectId;
            return {
              ...t,
              status: newStatus,
              blocker: newStatus === 'BLOCKED' ? blockerNote || 'Blocked in Linear workspace' : undefined,
            };
          }
          return t;
        });
        if (targetProjectId) recalculateProgress(targetProjectId, updated);
        return updated;
      });

      if (targetProjectId) {
        const newAct: Activity = {
          id: `act-linear-${Date.now()}`,
          projectId: targetProjectId,
          source: 'Linear',
          title: `Linear Event: ${taskTitle}`,
          description: `Task state changed to ${newStatus} via Linear Webhook event`,
          timestamp: new Date().toISOString(),
          author: 'Linear Webhook Integration',
        };
        setActivities((prev) => [newAct, ...prev]);
      }
    }
  };

  // Update Task Status
  const updateTaskStatus = (taskId: string, status: TaskStatus, blocker?: string) => {
    let targetProjectId = '';
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          targetProjectId = t.projectId;
          return {
            ...t,
            status,
            blocker: status === 'BLOCKED' ? blocker || 'Blocked by external dependency' : undefined,
          };
        }
        return t;
      });

      if (targetProjectId) {
        recalculateProgress(targetProjectId, updated);
      }
      return updated;
    });

    if (targetProjectId) {
      const taskObj = tasks.find((t) => t.id === taskId);
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        projectId: targetProjectId,
        source: 'User',
        title: 'Task Status Updated',
        description: `Task "${taskObj?.title || taskId}" status changed to ${status}`,
        timestamp: new Date().toISOString(),
        author: 'Current User',
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
  };

  // Update Project Status
  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status, lastUpdated: new Date().toISOString() } : p))
    );
  };

  // Add Issue
  const addIssue = (issueData: Omit<Issue, 'id'>) => {
    const newId = `i-${Date.now()}`;
    const newIssue: Issue = { ...issueData, id: newId };
    setIssues((prev) => [newIssue, ...prev]);
  };

  // Toggle Document Visibility
  const toggleDocumentVisibility = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, visibleToCustomer: !d.visibleToCustomer } : d))
    );
  };

  // Reset to Demo Data
  const resetToDemoData = async () => {
    try {
      await fetch(`${API_BASE_URL}/reset-demo`, { method: 'POST' });
      await fetchBackendProjects();
    } catch {
      setProjects(INITIAL_PROJECTS);

      setMilestones(INITIAL_MILESTONES);
      setTasks(INITIAL_TASKS);
      setIssues(INITIAL_ISSUES);
      setActivities(INITIAL_ACTIVITIES);
      setDocuments(INITIAL_DOCUMENTS);
    }
  };

  // Add New Project
  const addNewProject = (newProj: Partial<Project>, milestoneNames: string[], ownerIds: string[]) => {
    const projId = `p-${Date.now()}`;
    const createdProject: Project = {
      id: projId,
      customerId: newProj.customerId || 'c1',
      name: newProj.name || 'New Project Deployment',
      description: newProj.description || 'Project delivery baseline setup.',
      status: newProj.status || 'ON_TRACK',
      startDate: newProj.startDate || new Date().toISOString().split('T')[0],
      targetDate: newProj.targetDate || '2026-10-01',
      progress: 0,
      lastUpdated: new Date().toISOString(),
      ownerIds: ownerIds.length > 0 ? ownerIds : ['u1'],
      internalNotes: newProj.internalNotes || 'Initial baseline kickoff.',
      customerSummary: newProj.customerSummary || 'Project kick-off phase underway.',
    };

    setProjects((prev) => [createdProject, ...prev]);

    const newMsList: Milestone[] = [];
    const newTasksList: Task[] = [];

    milestoneNames.forEach((msName, idx) => {
      const msId = `m-${projId}-${idx + 1}`;
      newMsList.push({
        id: msId,
        projectId: projId,
        name: `${idx + 1}. ${msName}`,
        orderIndex: idx + 1,
        status: idx === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      });

      newTasksList.push({
        id: `t-${msId}-1`,
        milestoneId: msId,
        projectId: projId,
        title: `${msName} baseline task`,
        ownerId: ownerIds[0] || 'u1',
        status: idx === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        priority: 'HIGH',
        dueDate: createdProject.targetDate,
      });
    });

    setMilestones((prev) => [...prev, ...newMsList]);
    setTasks((prev) => [...prev, ...newTasksList]);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        customers,
        users,
        milestones,
        tasks,
        issues,
        activities,
        documents,
        viewMode,
        setViewMode,
        selectedProjectId,
        setSelectedProjectId,
        isBackendConnected,
        applyAIUpdate,
        triggerLinearWebhook,
        updateTaskStatus,
        updateProjectStatus,
        addIssue,
        toggleDocumentVisibility,
        resetToDemoData,
        addNewProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return ctx;
};
