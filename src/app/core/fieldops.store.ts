import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import {
  DemoRole,
  DemoSession,
  FieldOpsState,
  Inspection,
  InspectionDraft,
  InspectionModel,
  InspectionStatus,
  ModelSection,
  ResourceDraft,
  ResourceKind,
  ResourceRecord,
  UserRecord,
} from './fieldops.models';

const STATE_KEY = 'fieldops-demo-state-v1';
const USER_KEY = 'fieldops-demo-user';

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedState(): FieldOpsState {
  const now = dateOffset(0);
  const inspections: Inspection[] = [
    {
      id: 'insp-01',
      reference: 'INS-2026-014',
      title: 'Inspeção preventiva — Linha 2',
      equipment: 'Motor MTR-204',
      client: 'Metalúrgica Horizonte',
      location: 'Unidade São Paulo · Montagem',
      assignedTo: 'Lucas Mendes',
      dueDate: dateOffset(0),
      status: 'Em andamento',
      progress: 68,
    },
    {
      id: 'insp-02',
      reference: 'INS-2026-013',
      title: 'Verificação de segurança elétrica',
      equipment: 'Painel QD-08',
      client: 'Metalúrgica Horizonte',
      location: 'Unidade São Paulo · Elétrica',
      assignedTo: 'Ana Costa',
      dueDate: dateOffset(0),
      status: 'Aguardando revisão',
      progress: 100,
    },
    {
      id: 'insp-03',
      reference: 'INS-2026-012',
      title: 'Checklist de empilhadeira',
      equipment: 'Empilhadeira EMP-17',
      client: 'Logística Vale Verde',
      location: 'Centro de distribuição · Doca 4',
      assignedTo: 'Rafael Lima',
      dueDate: dateOffset(1),
      status: 'Planejada',
      progress: 0,
    },
    {
      id: 'insp-04',
      reference: 'INS-2026-011',
      title: 'Inspeção de compressor',
      equipment: 'Compressor CP-03',
      client: 'FrioSul Alimentos',
      location: 'Planta Campinas · Casa de máquinas',
      assignedTo: 'Mariana Alves',
      dueDate: dateOffset(1),
      status: 'Planejada',
      progress: 0,
    },
    {
      id: 'insp-05',
      reference: 'INS-2026-010',
      title: 'Ronda de segurança operacional',
      equipment: 'Área de envase',
      client: 'FrioSul Alimentos',
      location: 'Planta Campinas · Envase',
      assignedTo: 'Lucas Mendes',
      dueDate: dateOffset(-1),
      status: 'Atrasada',
      progress: 32,
    },
    {
      id: 'insp-06',
      reference: 'INS-2026-009',
      title: 'Inspeção de ponte rolante',
      equipment: 'Ponte rolante PR-02',
      client: 'Aço Forte S.A.',
      location: 'Unidade Sorocaba · Galpão B',
      assignedTo: 'Diego Santos',
      dueDate: dateOffset(-2),
      status: 'Aprovada',
      progress: 100,
    },
    {
      id: 'insp-07',
      reference: 'INS-2026-008',
      title: 'Auditoria de extintores',
      equipment: 'Sistema de combate a incêndio',
      client: 'Logística Vale Verde',
      location: 'Centro de distribuição · Bloco A',
      assignedTo: 'Ana Costa',
      dueDate: dateOffset(-3),
      status: 'Aprovada',
      progress: 100,
    },
  ];

  inspections[1].modelId = 'model-001';
  inspections[1].modelVersion = 2;
  inspections[1].priority = 'Alta';
  inspections[1].startedAt = `${dateOffset(0)}T08:42:00`;
  inspections[1].completedAt = `${dateOffset(0)}T10:17:00`;
  inspections[1].recordedLocation = 'Unidade São Paulo · 23.5505, -46.6333';
  inspections[1].answers = [
    { section: 'Inspeção visual', question: 'Proteção do painel íntegra?', response: 'Não conforme', observation: 'Proteção com trinca na dobradiça.', evidence: ['IMG_0412.jpg'], nonconformity: { severity: 'Alta', description: 'Proteção do painel elétrico danificada.' } },
    { section: 'Inspeção visual', question: 'Cabos sem desgaste?', response: 'Conforme', observation: 'Sem danos aparentes.' },
    { section: 'Medições', question: 'Tensão dentro da faixa nominal?', response: 'Conforme', observation: '381,2 V fase A.' },
  ];
  inspections[1].stateHistory = [
    { state: 'Planejada', at: `${dateOffset(-3)}T14:05:00`, by: 'Eng. Marcos Silveira', reason: 'Plano preventivo' },
    { state: 'Em andamento', at: `${dateOffset(0)}T08:42:00`, by: 'Ana Costa', reason: 'Check-in registrado' },
    { state: 'Aguardando revisão', at: `${dateOffset(0)}T10:20:00`, by: 'Ana Costa', reason: 'Checklist enviado para revisão' },
  ];
  inspections.forEach((item) => {
    item.lastUpdated ??= `${item.dueDate}T09:30:00`;
    item.priority ??= 'Normal';
    item.stateHistory ??= [{ state: item.status, at: `${item.dueDate}T09:00:00`, by: item.assignedTo }];
  });

  const records = (items: Array<Omit<ResourceRecord, 'id' | 'updatedAt'>>): ResourceRecord[] =>
    items.map((item, index) => ({
      ...item,
      id: `record-${index}-${item.reference}`,
      updatedAt: now,
    }));

  return {
    inspections,
    resources: {
      templates: records([
        {
          reference: 'MOD-001',
          title: 'Inspeção preventiva de motores',
          category: 'Mecânica',
          details: '18 itens · revisão 2.4 · atualizado por Ana Costa',
          status: 'Ativo',
        },
        {
          reference: 'MOD-002',
          title: 'Segurança elétrica industrial',
          category: 'Elétrica',
          details: '24 itens · revisão 1.8 · atualizado por Lucas Mendes',
          status: 'Ativo',
        },
        {
          reference: 'MOD-003',
          title: 'Checklist diário de empilhadeira',
          category: 'Operacional',
          details: '16 itens · revisão 3.1 · atualizado por Diego Santos',
          status: 'Ativo',
        },
        {
          reference: 'MOD-004',
          title: 'Ronda de segurança',
          category: 'Segurança',
          details: '12 itens · revisão 1.2 · atualizado por Mariana Alves',
          status: 'Em revisão',
        },
      ]),
      equipment: records([
        {
          reference: 'MTR-204',
          title: 'Motor elétrico — Linha 2',
          category: 'Motor elétrico',
          details: 'Metalúrgica Horizonte · Unidade São Paulo · última inspeção há 2 dias',
          status: 'Operacional',
          metadata: { clientId: 'record-0-CLI-001', locationId: 'record-0-LOC-001', serial: 'SN-MTR-204-8821', manufacturer: 'WEG', model: 'W22', qrCode: 'QR-MTR-204' },
        },
        {
          reference: 'QD-08',
          title: 'Painel de distribuição',
          category: 'Painel elétrico',
          details: 'Metalúrgica Horizonte · Unidade São Paulo · última inspeção há 5 dias',
          status: 'Atenção',
          metadata: { clientId: 'record-0-CLI-001', locationId: 'record-0-LOC-001', serial: 'SN-QD-08-1190', manufacturer: 'Schneider', model: 'PrismaSeT', qrCode: 'QR-QD-08' },
        },
        {
          reference: 'EMP-17',
          title: 'Empilhadeira elétrica',
          category: 'Movimentação',
          details: 'Logística Vale Verde · Centro de distribuição · inspeção hoje',
          status: 'Operacional',
          metadata: { clientId: 'record-1-CLI-002', locationId: 'record-1-LOC-002', serial: 'SN-EMP-17-3044', manufacturer: 'Still', model: 'RX 20', qrCode: 'QR-EMP-17' },
        },
        {
          reference: 'CP-03',
          title: 'Compressor de ar',
          category: 'Compressor',
          details: 'FrioSul Alimentos · Planta Campinas · inspeção em 4 dias',
          status: 'Manutenção',
          metadata: { clientId: 'record-2-CLI-003', locationId: 'record-2-LOC-003', serial: 'SN-CP-03-2201', manufacturer: 'Atlas Copco', model: 'GA 30', qrCode: 'QR-CP-03' },
        },
      ]),
      clients: records([
        {
          reference: 'CLI-001',
          title: 'Metalúrgica Horizonte',
          category: 'Indústria',
          details: 'São Paulo, SP · 2 unidades · 38 equipamentos',
          status: 'Ativo',
          metadata: { contact: 'Paula Martins', email: 'paula@horizonte.example', phone: '(11) 3333-4100', taxId: '12.345.678/0001-90' },
        },
        {
          reference: 'CLI-002',
          title: 'Logística Vale Verde',
          category: 'Logística',
          details: 'Jundiaí, SP · 1 unidade · 24 equipamentos',
          status: 'Ativo',
          metadata: { contact: 'Roberto Nunes', email: 'roberto@valeverde.example', phone: '(11) 4521-2030', taxId: '23.456.789/0001-01' },
        },
        {
          reference: 'CLI-003',
          title: 'FrioSul Alimentos',
          category: 'Alimentos',
          details: 'Campinas, SP · 2 unidades · 31 equipamentos',
          status: 'Ativo',
          metadata: { contact: 'Juliana Freitas', email: 'juliana@friosul.example', phone: '(19) 3232-5000', taxId: '34.567.890/0001-12' },
        },
        {
          reference: 'CLI-004',
          title: 'Aço Forte S.A.',
          category: 'Metalurgia',
          details: 'Sorocaba, SP · 1 unidade · 17 equipamentos',
          status: 'Inativo',
          metadata: { contact: 'Renato Souza', email: 'renato@acoforte.example', phone: '(15) 3000-0140', taxId: '45.678.901/0001-23' },
        },
      ]),
      locations: records([
        {
          reference: 'LOC-001',
          title: 'Unidade São Paulo',
          category: 'Fábrica',
          details: 'São Paulo, SP · 4 setores · 38 equipamentos',
          status: 'Ativo',
          metadata: { clientId: 'record-0-CLI-001', address: 'Av. Industrial, 1200 · São Paulo, SP', contact: 'Paula Martins', latitude: -23.5505, longitude: -46.6333 },
        },
        {
          reference: 'LOC-002',
          title: 'Centro de distribuição',
          category: 'Centro logístico',
          details: 'Jundiaí, SP · 3 setores · 24 equipamentos',
          status: 'Ativo',
          metadata: { clientId: 'record-1-CLI-002', address: 'Rod. Anhanguera, km 62 · Jundiaí, SP', contact: 'Roberto Nunes', latitude: -23.1857, longitude: -46.8978 },
        },
        {
          reference: 'LOC-003',
          title: 'Planta Campinas',
          category: 'Fábrica',
          details: 'Campinas, SP · 5 setores · 31 equipamentos',
          status: 'Ativo',
          metadata: { clientId: 'record-2-CLI-003', address: 'Rod. Santos Dumont, 400 · Campinas, SP', contact: 'Juliana Freitas', latitude: -22.9099, longitude: -47.0626 },
        },
        {
          reference: 'LOC-004',
          title: 'Unidade Sorocaba',
          category: 'Fábrica',
          details: 'Sorocaba, SP · 2 setores · 17 equipamentos',
          status: 'Ativo',
          metadata: { clientId: 'record-3-CLI-004', address: 'Av. Dom Aguirre, 920 · Sorocaba, SP', contact: 'Renato Souza', latitude: -23.5015, longitude: -47.4526 },
        },
      ]),
      nonconformities: records([
        {
          reference: 'NC-2026-018',
          title: 'Proteção do painel elétrico danificada',
          category: 'Alta · Segurança elétrica',
          details: 'Painel QD-08 · Unidade São Paulo · responsável: Lucas Mendes',
          status: 'Aberta',
          metadata: { severity: 'Alta', inspectionId: 'insp-02', item: 'Proteção do painel íntegra?', evidence: 'IMG_0412.jpg' },
        },
        {
          reference: 'NC-2026-017',
          title: 'Vazamento no sistema hidráulico',
          category: 'Média · Mecânica',
          details: 'Prensa PR-12 · Planta Campinas · responsável: Mariana Alves',
          status: 'Em tratamento',
          metadata: { severity: 'Média', inspectionId: 'insp-05', item: 'Inspeção do sistema hidráulico', evidence: 'IMG_0391.jpg' },
        },
        {
          reference: 'NC-2026-016',
          title: 'Sinalização de rota apagada',
          category: 'Baixa · Segurança',
          details: 'Centro de distribuição · Doca 2 · responsável: Rafael Lima',
          status: 'Aberta',
          metadata: { severity: 'Baixa', inspectionId: 'insp-03', item: 'Sinalização de rota', evidence: 'IMG_0377.jpg' },
        },
        {
          reference: 'NC-2026-015',
          title: 'Ruído acima do limite recomendado',
          category: 'Média · Operacional',
          details: 'Compressor CP-03 · Planta Campinas · responsável: Diego Santos',
          status: 'Resolvida',
          metadata: { severity: 'Média', inspectionId: 'insp-04', item: 'Nível de ruído', evidence: 'IMG_0312.jpg' },
        },
      ]),
      history: [
        {
          id: 'activity-01',
          reference: 'INS-2026-014',
          title: 'Inspeção iniciada',
          category: 'Inspeção',
          details: 'Lucas Mendes iniciou a inspeção preventiva da Linha 2.',
          status: 'Em andamento',
          updatedAt: now,
        },
        {
          id: 'activity-02',
          reference: 'INS-2026-013',
          title: 'Inspeção enviada para revisão',
          category: 'Revisão',
          details: 'Ana Costa concluiu o checklist de segurança elétrica.',
          status: 'Aguardando revisão',
          updatedAt: now,
        },
        {
          id: 'activity-03',
          reference: 'NC-2026-018',
          title: 'Não conformidade registrada',
          category: 'Não conformidade',
          details: 'Proteção do painel QD-08 precisa de reparo.',
          status: 'Aberta',
          updatedAt: now,
        },
        {
          id: 'activity-04',
          reference: 'INS-2026-009',
          title: 'Inspeção aprovada',
          category: 'Revisão',
          details: 'Diego Santos aprovou a inspeção da ponte rolante PR-02.',
          status: 'Aprovada',
          updatedAt: now,
        },
      ],
    },
    users: [
      { id: 'user-001', name: 'Marcos Silveira', email: 'marcos@fieldops.local', phone: '(11) 98888-1010', role: 'Administrador', status: 'Ativo', unit: 'São Paulo', resetPending: false, createdAt: now },
      { id: 'user-002', name: 'Ana Costa', email: 'ana.costa@fieldops.local', phone: '(11) 98888-2020', role: 'Revisor', status: 'Ativo', unit: 'São Paulo', resetPending: false, createdAt: now },
      { id: 'user-003', name: 'Lucas Mendes', email: 'lucas.mendes@fieldops.local', phone: '(19) 98888-3030', role: 'Técnico', status: 'Ativo', unit: 'Campinas', resetPending: false, createdAt: now },
      { id: 'user-004', name: 'Rafael Lima', email: 'rafael.lima@fieldops.local', phone: '(11) 98888-4040', role: 'Supervisor', status: 'Ativo', unit: 'Jundiaí', resetPending: false, createdAt: now },
      { id: 'user-005', name: 'Mariana Alves', email: 'mariana.alves@fieldops.local', phone: '(15) 98888-5050', role: 'Técnico', status: 'Inativo', unit: 'Sorocaba', resetPending: false, createdAt: now },
    ],
    models: [
      {
        id: 'model-001', code: 'MOD-001', title: 'Inspeção preventiva de motores', description: 'Verificação de segurança, integridade e parâmetros operacionais.', category: 'Mecânica', state: 'Publicado', version: 2,
        sections: [
          { id: 'sec-001', title: 'Inspeção visual', description: 'Avaliação do estado físico do equipamento.', order: 1, items: [
            { id: 'item-001', prompt: 'Proteções e carenagens estão íntegras?', responseType: 'Conforme/Não conforme', required: true, noteOnNonconformity: true, evidenceOnNonconformity: true, options: [], order: 1 },
            { id: 'item-002', prompt: 'Há vazamentos visíveis?', responseType: 'Sim/Não', required: true, noteOnNonconformity: true, evidenceOnNonconformity: true, options: [], order: 2 },
          ] },
          { id: 'sec-002', title: 'Medições', description: 'Registre os parâmetros verificados.', order: 2, items: [
            { id: 'item-003', prompt: 'Temperatura do rolamento (°C)', responseType: 'Número', required: true, noteOnNonconformity: false, evidenceOnNonconformity: false, options: [], order: 1 },
          ] },
        ], versions: [{ version: 1, publishedAt: `${dateOffset(-90)}T12:00:00`, summary: 'Publicação inicial' }, { version: 2, publishedAt: `${dateOffset(-30)}T12:00:00`, summary: 'Adicionadas medições de temperatura' }], createdAt: dateOffset(-90), updatedAt: dateOffset(-30),
      },
      { id: 'model-002', code: 'MOD-002', title: 'Segurança elétrica industrial', description: 'Checklist para inspeção de painéis e circuitos.', category: 'Elétrica', state: 'Publicado', version: 1, sections: [], versions: [{ version: 1, publishedAt: `${dateOffset(-25)}T12:00:00`, summary: 'Primeira versão publicada' }], createdAt: dateOffset(-25), updatedAt: dateOffset(-25) },
      { id: 'model-003', code: 'MOD-003', title: 'Ronda de segurança', description: 'Pontos de segurança da unidade.', category: 'Segurança', state: 'Rascunho', version: 0, sections: [], versions: [], createdAt: now, updatedAt: now },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class FieldOpsStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<FieldOpsState>(seedState());
  private readonly session = signal<DemoSession | null>(null);

  readonly inspections = computed(() => this.state().inspections);
  readonly resources = computed(() => this.state().resources);
  readonly users = computed(() => this.state().users);
  readonly models = computed(() => this.state().models);

  constructor() {
    if (isPlatformBrowser(this.platformId))
      afterNextRender(() => {
        this.restoreState();
        this.restoreSession();
      });
  }

  records(kind: ResourceKind): ResourceRecord[] {
    return this.state().resources[kind];
  }

  addInspection(draft: InspectionDraft): void {
    const reference = `INS-${new Date().getFullYear()}-${String(this.inspections().length + 8).padStart(3, '0')}`;
    const inspection: Inspection = {
      ...draft,
      id: newId(),
      reference,
      status: 'Planejada',
      progress: 0,
      lastUpdated: new Date().toISOString(),
      stateHistory: [{ state: 'Planejada', at: new Date().toISOString(), by: this.userName(), reason: 'Inspeção criada e atribuída' }],
    };
    this.commit({ ...this.state(), inspections: [inspection, ...this.inspections()] });
    this.addActivity(
      reference,
      'Inspeção planejada',
      `${draft.title} foi adicionada à agenda.`,
      'Planejada',
    );
  }

  updateInspection(id: string, status: InspectionStatus, progress?: number, note = ''): void {
    const current = this.inspections().find((inspection) => inspection.id === id);
    if (!current) return;
    const updated = this.inspections().map((inspection) =>
      inspection.id === id
          ? {
              ...inspection,
              status,
              progress: progress ?? inspection.progress,
              lastUpdated: new Date().toISOString(),
              startedAt: status === 'Em andamento' && !inspection.startedAt ? new Date().toISOString() : inspection.startedAt,
              completedAt: ['Aguardando revisão', 'Aprovada', 'Reprovada'].includes(status) ? new Date().toISOString() : inspection.completedAt,
              stateHistory: [...(inspection.stateHistory ?? []), { state: status, at: new Date().toISOString(), by: this.userName(), reason: note.trim() || undefined }],
            }
        : inspection,
    );
    this.commit({ ...this.state(), inspections: updated });
    const details = [`${current.title} · ${current.assignedTo}`, note.trim()]
      .filter(Boolean)
      .join(' · ');
    this.addActivity(current.reference, `Status alterado: ${status}`, details, status);
  }

  saveResource(kind: ResourceKind, draft: ResourceDraft, id?: string): void {
    const updatedAt = dateOffset(0);
    const current = this.records(kind);
    const record: ResourceRecord = { ...draft, id: id ?? newId(), updatedAt };
    const next = id
      ? current.map((item) => (item.id === id ? record : item))
      : [record, ...current];
    this.commit({ ...this.state(), resources: { ...this.state().resources, [kind]: next } });
    if (kind !== 'history') {
      this.addActivity(
        record.reference || 'REGISTRO',
        id ? 'Cadastro atualizado' : 'Cadastro criado',
        record.title,
        record.status,
      );
    }
  }

  deleteResource(kind: ResourceKind, id: string): void {
    const record = this.records(kind).find((item) => item.id === id);
    if (!record) return;
    this.commit({
      ...this.state(),
      resources: {
        ...this.state().resources,
        [kind]: this.records(kind).filter((item) => item.id !== id),
      },
    });
    this.addActivity(record.reference, 'Cadastro removido', record.title, 'Removido');
  }

  saveUser(name: string, email: string, role: DemoRole, remember = true): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const session = { name, email, role };
    this.session.set(session);
    if (remember) localStorage.setItem(USER_KEY, JSON.stringify(session));
    else localStorage.removeItem(USER_KEY);
  }

  saveUserRecord(draft: Omit<UserRecord, 'id' | 'createdAt' | 'resetPending'>, id?: string): void {
    const current = this.users();
    const existing = current.find((user) => user.id === id);
    const user: UserRecord = { ...draft, id: id ?? newId(), createdAt: existing?.createdAt ?? dateOffset(0), resetPending: existing?.resetPending ?? false };
    this.commit({ ...this.state(), users: id ? current.map((item) => item.id === id ? user : item) : [user, ...current] });
    this.addActivity(user.email, id ? 'Usuário atualizado' : 'Usuário cadastrado', `${user.name} · ${user.role}`, user.status);
  }

  updateUserStatus(id: string, status: UserRecord['status']): void {
    const user = this.users().find((item) => item.id === id);
    if (!user) return;
    this.commit({ ...this.state(), users: this.users().map((item) => item.id === id ? { ...item, status } : item) });
    this.addActivity(user.email, `Acesso ${status.toLocaleLowerCase('pt-BR')}`, user.name, status);
  }

  requestUserReset(id: string): void {
    const user = this.users().find((item) => item.id === id);
    if (!user) return;
    this.commit({ ...this.state(), users: this.users().map((item) => item.id === id ? { ...item, resetPending: true } : item) });
    this.addActivity(user.email, 'Redefinição de acesso solicitada', `${user.name} · fluxo de demonstração`, 'Pendente');
  }

  saveModel(model: InspectionModel): void {
    const current = this.models();
    const updated = { ...model, updatedAt: dateOffset(0) };
    this.commit({ ...this.state(), models: current.some((item) => item.id === model.id) ? current.map((item) => item.id === model.id ? updated : item) : [updated, ...current] });
    this.addActivity(model.code, 'Modelo salvo', model.title, model.state);
  }

  publishModel(model: InspectionModel): void {
    const version = model.version + 1;
    const published = { ...model, state: 'Publicado' as const, version, updatedAt: dateOffset(0), versions: [...model.versions, { version, publishedAt: new Date().toISOString(), summary: `${model.sections.length} seções · ${model.sections.reduce((sum, section) => sum + section.items.length, 0)} itens` }] };
    this.saveModel(published);
    this.addActivity(model.code, `Versão ${version} publicada`, model.title, 'Publicado');
  }

  userName(): string {
    return this.session()?.name ?? 'Eng. Marcos Silveira';
  }

  userRole(): DemoRole {
    return this.session()?.role ?? 'Supervisor';
  }

  roleLabel(): string {
    const roleTitles: Record<DemoRole, string> = {
      Administrador: 'Administrador do Sistema',
      Supervisor: 'Supervisor Técnico Sênior',
      Técnico: 'Técnico de Campo',
      Revisor: 'Revisor de Inspeções',
    };
    return roleTitles[this.userRole()];
  }

  isAuthenticated(): boolean {
    return this.session() !== null;
  }

  hasRole(roles: DemoRole[]): boolean {
    return roles.includes(this.userRole());
  }

  restoreSession(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (!saved) return false;
      const session = JSON.parse(saved) as DemoSession;
      if (!session.name || !session.email || !session.role) return false;
      this.session.set(session);
      return true;
    } catch {
      localStorage.removeItem(USER_KEY);
      return false;
    }
  }

  cycleDemoRole(): DemoRole {
    const roles: DemoRole[] = ['Administrador', 'Supervisor', 'Técnico', 'Revisor'];
    const next = roles[(roles.indexOf(this.userRole()) + 1) % roles.length];
    const current = this.session() ?? {
      name: this.userName(),
      email: 'demo@fieldops.local',
      role: next,
    };
    this.saveUser(current.name, current.email, next);
    return next;
  }

  logout(): void {
    this.session.set(null);
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(USER_KEY);
  }

  private addActivity(reference: string, title: string, details: string, status: string): void {
    const activity: ResourceRecord = {
      id: newId(),
      reference,
      title,
      category: 'Atividade',
      details,
      status,
      updatedAt: dateOffset(0),
    };
    const history = [activity, ...this.records('history')].slice(0, 100);
    this.commit({ ...this.state(), resources: { ...this.state().resources, history } });
  }

  private restoreState(): void {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FieldOpsState>;
        const defaults = seedState();
        this.state.set({
          ...defaults,
          ...parsed,
          resources: { ...defaults.resources, ...parsed.resources },
          users: parsed.users ?? defaults.users,
          models: parsed.models ?? defaults.models,
        });
        this.persist();
      } else this.persist();
    } catch {
      localStorage.removeItem(STATE_KEY);
      this.persist();
    }
  }

  private commit(next: FieldOpsState): void {
    this.state.set(next);
    this.persist();
  }

  private persist(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STATE_KEY, JSON.stringify(this.state()));
    }
  }
}
