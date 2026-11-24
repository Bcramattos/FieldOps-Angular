export type InspectionStatus =
  'Planejada' | 'Em andamento' | 'Aguardando revisão' | 'Aprovada' | 'Reprovada' | 'Atrasada' | 'Cancelada';

export type DemoRole = 'Administrador' | 'Supervisor' | 'Técnico' | 'Revisor';
export type ModelResponseType = 'Conforme/Não conforme' | 'Sim/Não' | 'Texto' | 'Número' | 'Seleção' | 'Foto';

export interface DemoSession {
  name: string;
  email: string;
  role: DemoRole;
}

export type ResourceKind =
  'templates' | 'equipment' | 'clients' | 'locations' | 'nonconformities' | 'history';

export interface Inspection {
  id: string;
  reference: string;
  title: string;
  equipment: string;
  client: string;
  location: string;
  assignedTo: string;
  dueDate: string;
  status: InspectionStatus;
  progress: number;
  priority?: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  clientId?: string;
  locationId?: string;
  equipmentId?: string;
  technicianId?: string;
  supervisor?: string;
  instructions?: string;
  modelId?: string;
  modelVersion?: number;
  lastUpdated?: string;
  startedAt?: string;
  completedAt?: string;
  recordedLocation?: string;
  answers?: InspectionAnswer[];
  stateHistory?: InspectionStateEvent[];
}

export interface InspectionAnswer {
  section: string;
  question: string;
  response: string;
  observation?: string;
  evidence?: string[];
  nonconformity?: { severity: string; description: string };
}

export interface InspectionStateEvent {
  state: InspectionStatus | 'Cancelada';
  at: string;
  by: string;
  reason?: string;
}

export interface ResourceRecord {
  id: string;
  reference: string;
  title: string;
  category: string;
  details: string;
  status: string;
  updatedAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: DemoRole;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  unit: string;
  resetPending: boolean;
  createdAt: string;
}

export interface ModelChecklistItem {
  id: string;
  prompt: string;
  responseType: ModelResponseType;
  required: boolean;
  noteOnNonconformity: boolean;
  evidenceOnNonconformity: boolean;
  options: string[];
  order: number;
}

export interface ModelSection {
  id: string;
  title: string;
  description: string;
  order: number;
  items: ModelChecklistItem[];
}

export interface InspectionModel {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  state: 'Rascunho' | 'Publicado' | 'Arquivado';
  version: number;
  sections: ModelSection[];
  versions: Array<{ version: number; publishedAt: string; summary: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionDraft {
  title: string;
  equipment: string;
  client: string;
  location: string;
  assignedTo: string;
  dueDate: string;
  priority?: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  supervisor?: string;
  instructions?: string;
  modelId?: string;
  clientId?: string;
  locationId?: string;
  equipmentId?: string;
  technicianId?: string;
  modelVersion?: number;
}

export interface ResourceDraft {
  reference: string;
  title: string;
  category: string;
  details: string;
  status: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface FieldOpsState {
  inspections: Inspection[];
  resources: Record<ResourceKind, ResourceRecord[]>;
  users: UserRecord[];
  models: InspectionModel[];
}
