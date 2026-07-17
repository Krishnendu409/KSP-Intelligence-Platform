export interface Investigation {
  id: string;
  title: string;
  codeName: string;
  objectives: string[];
  leadOfficer?: string;
  caseIds: string[];
  firIds: string[];
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PAUSED';
}

export interface InvestigationTask {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assignedToOfficerId?: string;
  createdAt: string;
}

class InvestigationRepositoryImpl {
  private investigations: Map<string, Investigation> = new Map();

  constructor() {
    this.loadDefaultNightfall();
  }

  private loadDefaultNightfall() {
    const defaultInv: Investigation = {
      id: 'INV-NIGHTFALL-001',
      title: 'Operation Nightfall - Kingpin & Syndicate Nexus',
      codeName: 'NIGHTFALL',
      objectives: [
        'Identify Hawala Layering Network & Primary Couriers',
        'Locate Abducted Victim & Safehouse Locations',
        'Map Syndicate Financial Flow across Axis Bank accounts'
      ],
      leadOfficer: 'DSP Ramesh Kumar',
      caseIds: ['CASE-2026-089', 'CASE-2026-104'],
      firIds: ['FIR-2026-089', 'FIR-2026-104'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.investigations.set(defaultInv.id, defaultInv);
  }

  private investigationEntities: Map<string, any[]> = new Map();
  private investigationTasks: Map<string, InvestigationTask[]> = new Map();

  createInvestigation(params: Partial<Investigation> & { title: string; codeName: string }): Investigation {
    const id = params.id || `INV-${params.codeName.toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
    const newInv: Investigation = {
      id,
      title: params.title,
      codeName: params.codeName,
      objectives: params.objectives || [],
      leadOfficer: params.leadOfficer || 'Unassigned',
      caseIds: params.caseIds || [],
      firIds: params.firIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: params.status || 'ACTIVE'
    };
    this.investigations.set(id, newInv);
    return newInv;
  }

  getInvestigation(id: string): Investigation | undefined {
    return this.investigations.get(id);
  }

  getAllInvestigations(): Investigation[] {
    return Array.from(this.investigations.values());
  }

  updateInvestigation(id: string, updates: Partial<Investigation>): Investigation | undefined {
    const existing = this.investigations.get(id);
    if (!existing) return undefined;
    const updated: Investigation = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.investigations.set(id, updated);
    return updated;
  }

  saveEntity(investigationId: string, entity: any): any {
    const list = this.investigationEntities.get(investigationId) || [];
    const index = list.findIndex(e => e.id === entity.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...entity };
    } else {
      list.push(entity);
    }
    this.investigationEntities.set(investigationId, list);
    return entity;
  }

  getEntitiesForInvestigation(investigationId: string): any[] {
    return this.investigationEntities.get(investigationId) || [];
  }

  createTask(task: Omit<InvestigationTask, 'id' | 'createdAt'> & { id?: string }): InvestigationTask {
    const newTask: InvestigationTask = {
      ...task,
      id: task.id || `TSK-${Math.floor(Math.random() * 100000)}`,
      createdAt: new Date().toISOString()
    };
    const list = this.investigationTasks.get(task.investigationId) || [];
    list.push(newTask);
    this.investigationTasks.set(task.investigationId, list);
    return newTask;
  }

  getTasksForInvestigation(investigationId: string): InvestigationTask[] {
    return this.investigationTasks.get(investigationId) || [];
  }

  updateTaskStatus(investigationId: string, taskId: string, status: InvestigationTask['status']): boolean {
    const list = this.investigationTasks.get(investigationId);
    if (!list) return false;
    const task = list.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      return true;
    }
    return false;
  }

  clearAll() {
    this.investigations.clear();
    this.investigationEntities.clear();
    this.investigationTasks.clear();
  }
}

export const investigationRepository = new InvestigationRepositoryImpl();

