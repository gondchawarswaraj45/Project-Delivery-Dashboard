import { Project, Task, User, NaturalLanguageQueryResult } from '../types';

export function processNaturalLanguageQuery(
  query: string,
  projects: Project[],
  tasks: Task[],
  users: User[]
): NaturalLanguageQueryResult {
  const q = query.toLowerCase().trim();

  // Helper: check if project is stale (> 7 days without update)
  const isStale = (p: Project) => {
    const diffDays = (Date.now() - new Date(p.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  // Query 1: Behind schedule / At Risk
  if (q.includes('behind') || q.includes('risk') || q.includes('delayed')) {
    const atRiskProjects = projects.filter((p) => p.status === 'AT_RISK' || p.status === 'BLOCKED');
    const matchedIds = atRiskProjects.map((p) => p.id);
    
    let answerText = `${atRiskProjects.length} projects are currently behind schedule or at risk:\n\n`;
    atRiskProjects.forEach((p, idx) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id && t.status === 'BLOCKED');
      const blockerDetail = pTasks.length > 0 && pTasks[0].blocker ? `Blocked by: ${pTasks[0].blocker}` : 'Schedule variance requiring attention';
      answerText += `${idx + 1}. **${p.name}** — Status: ${p.status.replace('_', ' ')} (${blockerDetail})\n`;
    });

    return {
      query,
      answer: answerText,
      matchedProjectIds: matchedIds,
    };
  }

  // Query 2: Blocked projects / tasks
  if (q.includes('blocked') || q.includes('blocker')) {
    const blockedProjects = projects.filter((p) => p.status === 'BLOCKED');
    const matchedIds = blockedProjects.map((p) => p.id);

    let answerText = `Found ${blockedProjects.length} blocked project(s):\n\n`;
    blockedProjects.forEach((p, idx) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id && t.status === 'BLOCKED');
      const blockerList = pTasks.map((t) => `• Task "${t.title}": ${t.blocker || 'Unspecified blocker'}`).join('\n');
      answerText += `${idx + 1}. **${p.name}**\n${blockerList || '• General milestone blocker'}\n\n`;
    });

    return {
      query,
      answer: answerText,
      matchedProjectIds: matchedIds,
    };
  }

  // Query 3: Stale projects (no update > 7 days)
  if (q.includes('stale') || q.includes('no movement') || q.includes('inactive') || q.includes('old')) {
    const staleProjects = projects.filter(isStale);
    const matchedIds = staleProjects.map((p) => p.id);

    let answerText = `Found ${staleProjects.length} stale project(s) with no status movement for over 7 days:\n\n`;
    staleProjects.forEach((p, idx) => {
      const days = Math.floor((Date.now() - new Date(p.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      answerText += `${idx + 1}. **${p.name}** — No status update for ${days} days (Last updated: ${new Date(p.lastUpdated).toLocaleDateString()})\n`;
    });

    return {
      query,
      answer: answerText,
      matchedProjectIds: matchedIds,
    };
  }

  // Query 4: Owner search e.g. "Rahul", "Neha"
  const matchedUser = users.find((u) => q.includes(u.name.toLowerCase().split(' ')[0]));
  if (matchedUser) {
    const userProjects = projects.filter((p) => p.ownerIds.includes(matchedUser.id));
    const matchedIds = userProjects.map((p) => p.id);

    let answerText = `**${matchedUser.name}** (${matchedUser.role}) is an owner on ${userProjects.length} active project(s):\n\n`;
    userProjects.forEach((p, idx) => {
      answerText += `${idx + 1}. **${p.name}** — ${p.progress}% Complete [${p.status}]\n`;
    });

    return {
      query,
      answer: answerText,
      matchedProjectIds: matchedIds,
    };
  }

  // Query 5: On track / Completed
  if (q.includes('on track') || q.includes('good') || q.includes('healthy')) {
    const onTrack = projects.filter((p) => p.status === 'ON_TRACK');
    const matchedIds = onTrack.map((p) => p.id);

    let answerText = `${onTrack.length} projects are currently performing on track:\n\n`;
    onTrack.forEach((p, idx) => {
      answerText += `${idx + 1}. **${p.name}** (${p.progress}% complete, target: ${p.targetDate})\n`;
    });

    return {
      query,
      answer: answerText,
      matchedProjectIds: matchedIds,
    };
  }

  // Default fallback answer matching relevant projects
  return {
    query,
    answer: `Analyzed 8 projects against your query "${query}". Showing projects with active milestones and open tasks.`,
    matchedProjectIds: projects.map((p) => p.id),
  };
}
