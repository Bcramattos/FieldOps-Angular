import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Inspection, InspectionStatus } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({
  selector: 'app-inspections-page',
  standalone: false,
  templateUrl: './inspections-page.component.html',
  styleUrl: '../../theme/original/dashboard.css',
})
export class InspectionsPageComponent {
  private readonly store = inject(FieldOpsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly inspections = this.store.inspections;
  query = '';
  statusFilter = '';
  clientFilter = '';
  technicianFilter = '';
  priorityFilter = '';
  fromDate = '';
  toDate = '';
  overdueOnly = false;
  reviewOnly = false;
  selected: Inspection | null = null;
  cancelTarget: Inspection | null = null;
  cancelReason = '';
  notice = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      if (params.get('new') === 'true') this.router.navigate(['/planning'], { queryParams: { new: 'true' } });
    });
  }

  get filteredInspections(): Inspection[] {
    const query = this.query.trim().toLocaleLowerCase('pt-BR');
    const today = this.today();
    return this.inspections().filter((inspection) => {
      const matchesQuery = !query || [inspection.reference, inspection.title, inspection.client, inspection.location, inspection.equipment, inspection.assignedTo].some((value) => value.toLocaleLowerCase('pt-BR').includes(query));
      const overdue = inspection.dueDate < today && !['Aprovada', 'Reprovada', 'Cancelada'].includes(inspection.status);
      return matchesQuery
        && (!this.statusFilter || inspection.status === this.statusFilter)
        && (!this.clientFilter || inspection.client === this.clientFilter)
        && (!this.technicianFilter || inspection.assignedTo === this.technicianFilter)
        && (!this.priorityFilter || inspection.priority === this.priorityFilter)
        && (!this.fromDate || inspection.dueDate >= this.fromDate)
        && (!this.toDate || inspection.dueDate <= this.toDate)
        && (!this.overdueOnly || overdue)
        && (!this.reviewOnly || inspection.status === 'Aguardando revisão');
    });
  }

  get clients(): string[] { return [...new Set(this.inspections().map((item) => item.client))].sort(); }
  get technicians(): string[] { return [...new Set(this.inspections().map((item) => item.assignedTo))].sort(); }
  get plannedCount(): number { return this.inspections().filter((item) => item.status === 'Planejada').length; }
  get runningCount(): number { return this.inspections().filter((item) => item.status === 'Em andamento').length; }
  get reviewCount(): number { return this.inspections().filter((item) => item.status === 'Aguardando revisão').length; }
  get canPlan(): boolean { return this.store.hasRole(['Administrador', 'Supervisor']); }
  get overdueCount(): number { return this.inspections().filter((item) => item.dueDate < this.today() && !['Aprovada', 'Reprovada', 'Cancelada'].includes(item.status)).length; }

  clearFilters(): void {
    this.query = ''; this.statusFilter = ''; this.clientFilter = ''; this.technicianFilter = ''; this.priorityFilter = ''; this.fromDate = ''; this.toDate = ''; this.overdueOnly = false; this.reviewOnly = false;
  }

  statusClass(status: InspectionStatus): string {
    return ({ 'Planejada': 'text-bg-secondary', 'Em andamento': 'text-bg-primary', 'Aguardando revisão': 'text-bg-warning', 'Aprovada': 'text-bg-success', 'Reprovada': 'text-bg-danger', 'Atrasada': 'text-bg-danger', 'Cancelada': 'text-bg-dark' } as Record<InspectionStatus, string>)[status];
  }

  isOverdue(item: Inspection): boolean { return item.dueDate < this.today() && !['Aprovada', 'Reprovada', 'Cancelada'].includes(item.status); }
  open(item: Inspection): void { this.selected = item; }
  canOperate(item: Inspection): boolean { return this.store.hasRole(['Administrador', 'Supervisor']) || (this.store.userRole() === 'Técnico' && this.store.userName() === item.assignedTo); }
  start(item: Inspection): void { if (!this.canOperate(item)) return; this.store.updateInspection(item.id, 'Em andamento', Math.max(item.progress, 5), 'Execução iniciada pelo painel de acompanhamento.'); this.notice = `${item.reference} iniciada.`; }
  submitForReview(item: Inspection): void { if (!this.canOperate(item)) return; this.store.updateInspection(item.id, 'Aguardando revisão', 100, 'Checklist enviado para revisão.'); this.notice = `${item.reference} enviada para revisão.`; }
  askCancel(item: Inspection): void { if (!this.store.hasRole(['Administrador', 'Supervisor'])) return; this.cancelTarget = item; this.cancelReason = ''; }
  cancel(): void {
    if (!this.cancelTarget || !this.cancelReason.trim() || !this.store.hasRole(['Administrador', 'Supervisor'])) return;
    const target = this.cancelTarget;
    this.store.updateInspection(target.id, 'Cancelada', undefined, this.cancelReason.trim());
    this.notice = `${target.reference} cancelada com justificativa registrada.`;
    this.cancelTarget = null;
  }
  goToPlanning(): void { if (this.canPlan) this.router.navigate(['/planning'], { queryParams: { new: 'true' } }); }
  formatDate(value: string): string { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)); }
  private today(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
}
