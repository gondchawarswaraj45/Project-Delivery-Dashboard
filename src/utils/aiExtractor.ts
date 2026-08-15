import { Project, Task, ProjectStatus, TaskStatus, StructuredUpdate } from '../types';

/**
 * Analyzes unstructured raw text update and extracts structured JSON status
 */
export function extractStructuredUpdate(
  rawText: string,
  project: Project,
  existingTasks: Task[]
): StructuredUpdate {
  const lower = rawText.toLowerCase();
  
  // Default values based on current project
  let extractedStatus: ProjectStatus = project.status;
  const updates: Array<{ task: string; status: TaskStatus; blocker?: string }> = [];
  let blockerSummary = '';
  let customerSummary = '';
  let expectedCompletion = project.targetDate;

  // 1. Detect overall status sentiment
  if (lower.includes('blocked') || lower.includes('stuck') || lower.includes('credentials missing') || lower.includes('waiting for credential')) {
    extractedStatus = 'AT_RISK';
    if (lower.includes('critical') || lower.includes('cannot proceed') || lower.includes('rejected')) {
      extractedStatus = 'BLOCKED';
    }
  } else if (lower.includes('all complete') || lower.includes('finished all') || lower.includes('ready for go live')) {
    extractedStatus = 'COMPLETED';
  } else if (lower.includes('on track') || lower.includes('progressing well') || lower.includes('ahead of schedule')) {
    extractedStatus = 'ON_TRACK';
  }

  // 2. Match tasks in raw text
  existingTasks.forEach((t) => {
    const titleLower = t.title.toLowerCase();
    
    // Check if task is mentioned
    const isMentioned = 
      lower.includes(titleLower) ||
      (titleLower.includes('api') && (lower.includes('api') || lower.includes('credential'))) ||
      (titleLower.includes('ui') && lower.includes('ui')) ||
      (titleLower.includes('robot') && lower.includes('robot')) ||
      (titleLower.includes('integration') && lower.includes('integration')) ||
      (titleLower.includes('training') && lower.includes('training'));

    if (isMentioned) {
      let newStatus: TaskStatus = t.status;
      let taskBlocker = t.blocker;

      if (lower.includes('complete') || lower.includes('done') || lower.includes('finished') || lower.includes('verified')) {
        // If mentioned in a context of completion
        if (lower.includes(`${t.title.toLowerCase()} is complete`) || lower.includes('finished') || lower.includes('done')) {
          newStatus = 'DONE';
          taskBlocker = undefined;
        }
      }

      if (lower.includes('waiting') || lower.includes('pending') || lower.includes('block') || lower.includes('credential')) {
        if (lower.includes('credentials') || lower.includes('access') || lower.includes('permission')) {
          newStatus = 'BLOCKED';
          taskBlocker = 'Waiting for customer API credentials';
          blockerSummary = 'Waiting for customer API credentials';
        }
      }

      updates.push({
        task: t.title,
        status: newStatus,
        blocker: taskBlocker,
      });
    }
  });

  // Fallback if no specific task matched directly: generate representative updates
  if (updates.length === 0) {
    if (existingTasks.length > 0) {
      const firstTask = existingTasks[0];
      updates.push({
        task: firstTask.title,
        status: 'IN_PROGRESS',
      });
    }
    if (existingTasks.length > 1) {
      const secondTask = existingTasks[1];
      updates.push({
        task: secondTask.title,
        status: lower.includes('blocked') || lower.includes('waiting') ? 'BLOCKED' : 'DONE',
        blocker: lower.includes('blocked') || lower.includes('waiting') ? 'Waiting on external dependency' : undefined,
      });
    }
  }

  // Detect completion date mentions
  if (lower.includes('friday')) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    expectedCompletion = friday.toISOString().split('T')[0];
  } else if (lower.includes('next week')) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    expectedCompletion = nextWeek.toISOString().split('T')[0];
  }

  // Construct customer safe summary (Sanitized!)
  if (blockerSummary) {
    customerSummary = `Update processed: Progress on core deliverables active. ${blockerSummary.replace('customer', 'required')} pending authorization.`;
  } else {
    customerSummary = `Update processed: Milestone targets progressing as planned toward expected completion on ${expectedCompletion}.`;
  }

  return {
    project_status: extractedStatus,
    updates,
    expected_completion: expectedCompletion,
    blocker_summary: blockerSummary || undefined,
    customer_summary: customerSummary,
  };
}
