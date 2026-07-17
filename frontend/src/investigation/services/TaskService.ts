export interface InvestigationTask {
  id: string;
  investigationId: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  assignedOfficer: string;
  dueDate?: string;
  linkedEntityIds: string[];
  linkedEvidenceIds: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

class TaskServiceImpl {
  private tasks: Map<string, InvestigationTask> = new Map();

  createTask(investigationId: string, params: Partial<InvestigationTask> & { title: string }): InvestigationTask {
    const id = params.id || `TSK-${Math.floor(Math.random() * 100000)}`;
    const task: InvestigationTask = {
      id,
      investigationId,
      title: params.title,
      priority: params.priority || 'ROUTINE',
      status: params.status || 'PENDING',
      assignedOfficer: params.assignedOfficer || 'Unassigned Officer',
      dueDate: params.dueDate,
      linkedEntityIds: params.linkedEntityIds || [],
      linkedEvidenceIds: params.linkedEvidenceIds || [],
      comments: params.comments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }

  getTask(id: string): InvestigationTask | undefined {
    return this.tasks.get(id);
  }

  getTasksForInvestigation(investigationId: string): InvestigationTask[] {
    return Array.from(this.tasks.values()).filter(t => t.investigationId === investigationId);
  }

  updateTaskStatus(id: string, status: InvestigationTask['status']): InvestigationTask | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated: InvestigationTask = {
      ...existing,
      status,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  clearAll() {
    this.tasks.clear();
  }
}

export const taskService = new TaskServiceImpl();
