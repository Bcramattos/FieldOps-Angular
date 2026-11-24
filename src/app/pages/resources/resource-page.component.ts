import { isPlatformBrowser } from '@angular/common';
import { Directive, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Inspection, ResourceDraft, ResourceKind, ResourceRecord } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

export interface ResourcePageConfig { title: string; singular: string; description: string; statuses: string[]; }
export const RESOURCE_CONFIG: Record<ResourceKind, ResourcePageConfig> = {
  templates: { title: 'Modelos de inspeção', singular: 'modelo', description: 'Construa checklists publicados e versionados.', statuses: ['Rascunho', 'Publicado', 'Arquivado'] },
  equipment: { title: 'Equipamentos', singular: 'equipamento', description: 'Gerencie os equipamentos e acompanhe seu histórico de inspeções.', statuses: ['Operacional', 'Atenção', 'Manutenção', 'Inativo'] },
  clients: { title: 'Clientes', singular: 'cliente', description: 'Cadastre clientes e consulte locais relacionados.', statuses: ['Ativo', 'Inativo'] },
  locations: { title: 'Locais', singular: 'local', description: 'Vincule locais a clientes e acompanhe equipamentos relacionados.', statuses: ['Ativo', 'Inativo'] },
  nonconformities: { title: 'Não conformidades', singular: 'não conformidade', description: 'Consulte ocorrências, criticidade, evidências e itens relacionados.', statuses: ['Aberta', 'Em tratamento', 'Resolvida'] },
  history: { title: 'Histórico de atividades', singular: 'atividade', description: 'Consulte ações registradas para rastreabilidade.', statuses: [] },
};

@Directive()
export class ResourcePageController implements OnDestroy {
  kind: ResourceKind = 'equipment';
  query = '';
  statusFilter = '';
  criticalityFilter = '';
  modalOpen = false;
  relationOpen = false;
  selectedRecord: ResourceRecord | null = null;
  editingId: string | null = null;
  notice = '';
  draft: ResourceDraft = this.emptyDraft();
  clientId = '';
  locationId = '';
  address = '';
  contact = '';
  latitude = '';
  longitude = '';
  serial = '';
  manufacturer = '';
  model = '';
  qrCode = '';

  constructor(public readonly store: FieldOpsStore, @Inject(PLATFORM_ID) protected readonly platformId: object) {}
  ngOnDestroy(): void {}
  get config(): ResourcePageConfig { return RESOURCE_CONFIG[this.kind]; }
  get records(): ResourceRecord[] { return this.store.records(this.kind); }
  get canManage(): boolean { return this.store.hasRole(['Administrador', 'Supervisor']); }
  get clients(): ResourceRecord[] { return this.store.records('clients').filter((record) => record.status === 'Ativo'); }
  get locations(): ResourceRecord[] { return this.store.records('locations').filter((record) => record.status === 'Ativo' && (!this.clientId || record.metadata?.['clientId'] === this.clientId)); }
  get filteredRecords(): ResourceRecord[] {
    const query = this.query.trim().toLocaleLowerCase('pt-BR');
    return this.records.filter((record) => {
      const queryMatch = !query || [record.reference, record.title, record.category, record.details, record.status, String(record.metadata?.['serial'] ?? ''), String(record.metadata?.['manufacturer'] ?? '')].some((value) => value.toLocaleLowerCase('pt-BR').includes(query));
      const statusMatch = !this.statusFilter || (this.kind === 'history' ? record.category === this.statusFilter : record.status === this.statusFilter);
      const criticalityMatch = !this.criticalityFilter || record.category.toLocaleLowerCase('pt-BR').includes(this.criticalityFilter.toLocaleLowerCase('pt-BR'));
      const relationMatch = !(this.kind === 'equipment' && this.locationId) || record.metadata?.['locationId'] === this.locationId;
      const clientMatch = !(this.kind === 'locations' && this.clientId) || record.metadata?.['clientId'] === this.clientId;
      return queryMatch && statusMatch && criticalityMatch && relationMatch && clientMatch;
    });
  }
  get activeCount(): number { return this.records.filter((record) => ['Ativo', 'Operacional', 'Aberta', 'Em tratamento'].includes(record.status)).length; }
  get attentionCount(): number { return this.records.filter((record) => ['Atenção', 'Manutenção', 'Aberta', 'Em tratamento'].includes(record.status)).length; }
  get countByCriticality(): Record<string, number> { const records = this.store.records('nonconformities'); return { Crítica: records.filter((record) => record.category.toLocaleLowerCase('pt-BR').includes('crítica')).length, Alta: records.filter((record) => record.category.toLocaleLowerCase('pt-BR').includes('alta')).length, Média: records.filter((record) => record.category.toLocaleLowerCase('pt-BR').includes('média')).length, Baixa: records.filter((record) => record.category.toLocaleLowerCase('pt-BR').includes('baixa')).length }; }
  get openNonconformities(): number { return this.store.records('nonconformities').filter((record) => record.status !== 'Resolvida').length; }
  get latestActivities(): ResourceRecord[] { return this.filteredRecords; }
  get historyCategories(): string[] { return [...new Set(this.records.map((record) => record.category))].sort(); }
  get finalizedInspections(): number { return this.store.inspections().filter((item) => ['Aprovada', 'Reprovada'].includes(item.status)).length; }
  get reviewActivities(): number { return this.records.filter((record) => record.category === 'Revisão').length; }
  clearFilters(): void { this.query = ''; this.statusFilter = ''; this.criticalityFilter = ''; if (this.kind === 'equipment') this.locationId = ''; if (this.kind === 'locations') this.clientId = ''; }
  openCreate(): void { if (!this.canManage || this.kind === 'history') return; this.editingId = null; this.draft = this.emptyDraft(); this.clearMetadata(); this.modalOpen = true; }
  openEdit(record: ResourceRecord): void { if (!this.canManage) return; this.editingId = record.id; this.draft = { reference: record.reference, title: record.title, category: record.category, details: record.details, status: record.status, metadata: { ...(record.metadata ?? {}) } }; const meta = record.metadata ?? {}; this.clientId = String(meta['clientId'] ?? ''); this.locationId = String(meta['locationId'] ?? ''); this.address = String(meta['address'] ?? ''); this.contact = String(meta['contact'] ?? ''); this.latitude = String(meta['latitude'] ?? ''); this.longitude = String(meta['longitude'] ?? ''); this.serial = String(meta['serial'] ?? ''); this.manufacturer = String(meta['manufacturer'] ?? ''); this.model = String(meta['model'] ?? ''); this.qrCode = String(meta['qrCode'] ?? ''); this.modalOpen = true; }
  clientChanged(): void { this.locationId = ''; }
  save(): void {
    if (!this.canManage || !this.draft.title.trim()) return;
    const metadata: Record<string, string | number | boolean> = { ...(this.draft.metadata ?? {}) };
    if (this.kind === 'locations') { metadata['clientId'] = this.clientId; metadata['address'] = this.address; metadata['contact'] = this.contact; if (this.latitude) metadata['latitude'] = Number(this.latitude); if (this.longitude) metadata['longitude'] = Number(this.longitude); }
    if (this.kind === 'equipment') { metadata['locationId'] = this.locationId; const location = this.store.records('locations').find((item) => item.id === this.locationId); if (location) metadata['clientId'] = String(location.metadata?.['clientId'] ?? ''); metadata['serial'] = this.serial; metadata['manufacturer'] = this.manufacturer; metadata['model'] = this.model; metadata['qrCode'] = this.qrCode; }
    if (this.kind === 'clients') { metadata['contact'] = this.contact; metadata['phone'] = String(metadata['phone'] ?? ''); }
    const record: ResourceDraft = { ...this.draft, reference: this.draft.reference.trim() || this.makeReference(), title: this.draft.title.trim(), category: this.draft.category.trim() || this.config.singular, details: this.draft.details.trim(), status: this.draft.status || this.config.statuses[0] || 'Atividade', metadata };
    this.store.saveResource(this.kind, record, this.editingId ?? undefined);
    this.notice = `${this.config.singular} ${this.editingId ? 'atualizado' : 'cadastrado'} com sucesso.`; this.modalOpen = false;
  }
  toggleActive(record: ResourceRecord): void { if (!this.canManage) return; const next = record.status === 'Inativo' ? (this.kind === 'equipment' ? 'Operacional' : 'Ativo') : 'Inativo'; this.store.saveResource(this.kind, { reference: record.reference, title: record.title, category: record.category, details: record.details, status: next, metadata: record.metadata }, record.id); this.notice = `${record.title} ${next === 'Inativo' ? 'inativado' : 'reativado'}.`; }
  remove(record: ResourceRecord): void { if (!this.canManage || !isPlatformBrowser(this.platformId)) return; if (window.confirm(`Remover “${record.title}” dos dados locais?`)) { this.store.deleteResource(this.kind, record.id); this.notice = 'Registro removido.'; } }
  showRelated(record: ResourceRecord): void { this.selectedRecord = record; this.relationOpen = true; }
  relatedClient(record: ResourceRecord): string { const id = String(record.metadata?.['clientId'] ?? ''); return this.store.records('clients').find((item) => item.id === id)?.title ?? 'Cliente não vinculado'; }
  relatedLocation(record: ResourceRecord): string { const id = String(record.metadata?.['locationId'] ?? ''); return this.store.records('locations').find((item) => item.id === id)?.title ?? 'Local não vinculado'; }
  relatedRecords(record: ResourceRecord): ResourceRecord[] { if (this.kind === 'clients') return this.store.records('locations').filter((item) => item.metadata?.['clientId'] === record.id); if (this.kind === 'locations') return this.store.records('equipment').filter((item) => item.metadata?.['locationId'] === record.id); return []; }
  relatedInspections(record: ResourceRecord) { return this.store.inspections().filter((item) => this.kind === 'equipment' ? item.equipmentId === record.id || item.equipment.includes(record.reference) : this.kind === 'clients' ? item.clientId === record.id || item.client === record.title : item.locationId === record.id || item.location.includes(record.title)); }
  relatedEquipmentCount(record: ResourceRecord): number { return this.store.records('equipment').filter((item) => item.metadata?.['locationId'] === record.id).length; }
  inspectionFor(record: ResourceRecord): Inspection | null { const id = String(record.metadata?.['inspectionId'] ?? ''); return this.store.inspections().find((item) => item.id === id || item.reference === id) ?? null; }
  get criticalCount(): number { return this.records.filter((record) => ['Crítica', 'Alta'].includes(String(record.metadata?.['severity'] ?? record.category.split(' · ')[0])) && record.status !== 'Resolvida').length; }
  get treatmentCount(): number { return this.records.filter((record) => record.status === 'Em tratamento').length; }
  get resolvedCount(): number { return this.records.filter((record) => record.status === 'Resolvida').length; }
  severityLabel(record: ResourceRecord): string { return String(record.metadata?.['severity'] ?? record.category.split(' · ')[0]); }
  exportCsv(): void { if (!isPlatformBrowser(this.platformId)) return; const rows = [['Referência', 'Nome', 'Categoria', 'Detalhes', 'Estado', 'Atualizado'], ...this.filteredRecords.map((r) => [r.reference,r.title,r.category,r.details,r.status,r.updatedAt])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"','""')}"`).join(';')).join('\r\n'); const url = URL.createObjectURL(new Blob(['\ufeff',csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `fieldops-${this.kind}-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url); this.notice = 'Arquivo CSV exportado.'; }
  metadata(record: ResourceRecord, key: string): string { const value = record.metadata?.[key]; return value === undefined ? '—' : String(value); }
  private emptyDraft(): ResourceDraft { return { reference: '', title: '', category: '', details: '', status: '' }; }
  private clearMetadata(): void { this.clientId = ''; this.locationId = ''; this.address = ''; this.contact = ''; this.latitude = ''; this.longitude = ''; this.serial = ''; this.manufacturer = ''; this.model = ''; this.qrCode = ''; }
  private makeReference(): string { const prefix: Record<ResourceKind,string> = { templates:'MOD', equipment:'EQP', clients:'CLI', locations:'LOC', nonconformities:'NC', history:'ACT' }; return `${prefix[this.kind]}-${String(this.records.length + 1).padStart(3,'0')}`; }
}
