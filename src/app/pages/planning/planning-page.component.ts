import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Inspection, InspectionDraft, InspectionStatus, ResourceRecord, UserRecord } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

interface WeekDay { key: string; day: number; label: string; isToday: boolean; inspections: Inspection[]; }

@Component({
  selector: 'app-planning-page',
  standalone: false,
  templateUrl: './planning-page.component.html',
  styleUrls: ['../../theme/original/planejamento.css', './planning-page.component.css'],
})
export class PlanningPageComponent {
  private readonly store = inject(FieldOpsStore);
  private readonly route = inject(ActivatedRoute);
  readonly inspections = this.store.inspections;
  readonly users = this.store.users;
  readonly models = this.store.models;
  cursor = this.startOfWeek(new Date());
  selectedDate = this.iso(new Date());
  query = '';
  statusFilter = '';
  technicianFilter = '';
  modalOpen = false;
  notice = '';
  error = '';
  draft: InspectionDraft = this.emptyDraft();
  clientId = '';
  locationId = '';
  equipmentId = '';
  modelId = '';
  technicianId = '';
  supervisorId = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => { if (params.get('new') === 'true') this.openCreate(); });
  }

  get clients(): ResourceRecord[] { return this.store.records('clients').filter((r) => r.status === 'Ativo'); }
  get locations(): ResourceRecord[] { return this.store.records('locations').filter((r) => r.status === 'Ativo' && (!this.clientId || r.metadata?.['clientId'] === this.clientId)); }
  get equipment(): ResourceRecord[] { return this.store.records('equipment').filter((r) => r.status !== 'Inativo' && (!this.locationId || r.metadata?.['locationId'] === this.locationId)); }
  get publishedModels() { return this.models().filter((m) => m.state === 'Publicado'); }
  get activeTechnicians(): UserRecord[] { return this.users().filter((u) => u.status === 'Ativo' && u.role === 'Técnico'); }
  get activeSupervisors(): UserRecord[] { return this.users().filter((u) => u.status === 'Ativo' && ['Supervisor', 'Administrador'].includes(u.role)); }
  get canPlan(): boolean { return this.store.hasRole(['Administrador', 'Supervisor']); }
  get selectedModelName(): string { return this.publishedModels.find((model) => model.id === this.modelId)?.title ?? 'Aguardando seleção'; }
  get selectedClientName(): string { return this.clients.find((client) => client.id === this.clientId)?.title ?? 'Aguardando seleção'; }
  get selectedLocationName(): string { return this.locations.find((location) => location.id === this.locationId)?.title ?? 'Aguardando seleção'; }
  get selectedEquipmentName(): string { return this.equipment.find((item) => item.id === this.equipmentId)?.title ?? 'Aguardando seleção'; }
  get selectedTechnicianName(): string { return this.activeTechnicians.find((user) => user.id === this.technicianId)?.name ?? 'Aguardando seleção'; }
  get weekLabel(): string {
    const end = new Date(this.cursor); end.setDate(end.getDate() + 6);
    const startMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(this.cursor);
    const endMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(end);
    return `${this.cursor.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}, ${end.getFullYear()}`;
  }
  get weekDays(): WeekDay[] {
    const today = this.iso(new Date());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(this.cursor); date.setDate(date.getDate() + index);
      const key = this.iso(date);
      return { key, day: date.getDate(), label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '').toUpperCase(), isToday: key === today, inspections: this.inspections().filter((item) => item.dueDate === key).slice(0, 3) };
    });
  }
  get filteredInspections(): Inspection[] {
    const query = this.query.trim().toLocaleLowerCase('pt-BR');
    return this.inspections().filter((item) => item.dueDate === this.selectedDate)
      .filter((item) => (!query || [item.title, item.reference, item.equipment, item.assignedTo, item.client].some((value) => value.toLocaleLowerCase('pt-BR').includes(query))))
      .filter((item) => !this.statusFilter || item.status === this.statusFilter)
      .filter((item) => !this.technicianFilter || item.assignedTo === this.technicianFilter)
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }
  get scheduledCount(): number { return this.inspections().filter((i) => ['Planejada', 'Em andamento'].includes(i.status)).length; }
  get todayCount(): number { return this.inspections().filter((i) => i.dueDate === this.iso(new Date())).length; }
  get overdueCount(): number { const today = this.iso(new Date()); return this.inspections().filter((i) => i.dueDate < today && !['Aprovada', 'Reprovada', 'Cancelada'].includes(i.status)).length; }
  get completedCount(): number { return this.inspections().filter((i) => ['Aprovada', 'Reprovada'].includes(i.status) && i.dueDate.slice(0, 7) === this.iso(new Date()).slice(0, 7)).length; }

  moveWeek(delta: number): void { this.cursor = new Date(this.cursor); this.cursor.setDate(this.cursor.getDate() + delta * 7); }
  goToday(): void { this.cursor = this.startOfWeek(new Date()); this.selectedDate = this.iso(new Date()); }
  selectDay(day: WeekDay): void { this.selectedDate = day.key; }
  openCreate(): void { if (!this.canPlan) return; this.draft = this.emptyDraft(); this.draft.dueDate = this.selectedDate; this.clientId = ''; this.locationId = ''; this.equipmentId = ''; this.modelId = ''; this.technicianId = ''; this.supervisorId = ''; this.modalOpen = true; this.error = ''; }
  clientChanged(): void { this.locationId = ''; this.equipmentId = ''; this.draft.clientId = this.clientId; this.draft.client = this.clients.find((x) => x.id === this.clientId)?.title ?? ''; }
  locationChanged(): void { this.equipmentId = ''; this.draft.locationId = this.locationId; this.draft.location = this.locations.find((x) => x.id === this.locationId)?.title ?? ''; }
  equipmentChanged(): void { const record = this.equipment.find((x) => x.id === this.equipmentId); this.draft.equipmentId = record?.id; this.draft.equipment = record ? `${record.reference} · ${record.title}` : ''; }
  modelChanged(): void { const model = this.publishedModels.find((x) => x.id === this.modelId); this.draft.modelId = model?.id; this.draft.title = model?.title ?? ''; }
  technicianChanged(): void { const user = this.activeTechnicians.find((x) => x.id === this.technicianId); this.draft.technicianId = user?.id; this.draft.assignedTo = user?.name ?? ''; }
  supervisorChanged(): void { this.draft.supervisor = this.activeSupervisors.find((x) => x.id === this.supervisorId)?.name ?? ''; }
  createInspection(): void {
    if (!this.canPlan) return;
    if (!this.modelId || !this.clientId || !this.locationId || !this.equipmentId || !this.technicianId || !this.supervisorId || !this.draft.dueDate || !this.draft.title.trim()) { this.error = 'Selecione modelo publicado, cliente, local, equipamento, técnico, supervisor e data prevista.'; return; }
    const model = this.publishedModels.find((x) => x.id === this.modelId)!;
    this.store.addInspection({ ...this.draft, title: this.draft.title.trim(), modelId: model.id, modelVersion: model.version, priority: this.draft.priority || 'Normal' });
    this.selectedDate = this.draft.dueDate; this.cursor = this.startOfWeek(new Date(`${this.selectedDate}T12:00:00`)); this.modalOpen = false; this.error = ''; this.notice = 'Inspeção criada e atribuída com sucesso.';
  }
  statusClass(status: InspectionStatus): string {
    return ({ 'Planejada': 'scheduled', 'Em andamento': 'in-progress', 'Aguardando revisão': 'pending', 'Aprovada': 'completed', 'Reprovada': 'overdue', 'Atrasada': 'overdue', 'Cancelada': 'cancelled' } as Record<InspectionStatus, string>)[status];
  }
  formatDate(value: string): string { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)); }
  initials(name: string): string { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  private emptyDraft(): InspectionDraft { return { title: '', equipment: '', client: '', location: '', assignedTo: '', dueDate: this.iso(new Date()), priority: 'Normal' }; }
  private iso(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  private startOfWeek(date: Date): Date { const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); return start; }
}
