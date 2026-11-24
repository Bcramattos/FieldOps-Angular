import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Inspection, InspectionStatus } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({
  selector: 'app-dashboard-page',
  standalone: false,
  templateUrl: './dashboard-page.component.html',
  styleUrl: '../../theme/original/dashboard.css',
})
export class DashboardPageComponent {
  private readonly store = inject(FieldOpsStore);
  private readonly router = inject(Router);
  readonly inspections = this.store.inspections;
  readonly weeklyDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly criticalities = [
    { key: 'Crítica', dot: 'critical', fill: 'critical-fill' },
    { key: 'Alta', dot: 'high', fill: 'high-fill' },
    { key: 'Média', dot: 'medium', fill: 'medium-fill' },
    { key: 'Baixa', dot: 'low', fill: 'low-fill' },
  ];
  readonly inspectionStatuses: InspectionStatus[] = ['Planejada', 'Em andamento', 'Aguardando revisão', 'Aprovada', 'Reprovada', 'Atrasada', 'Cancelada'];

  get userName(): string {
    return this.store.userName();
  }

  get scheduledCount(): number {
    return this.inspections().filter((item) => item.status === 'Planejada').length;
  }

  get inProgressCount(): number {
    return this.inspections().filter((item) => item.status === 'Em andamento').length;
  }

  get reviewCount(): number {
    return this.inspections().filter((item) => item.status === 'Aguardando revisão').length;
  }

  get completedCount(): number {
    return this.inspections().filter((item) => item.status === 'Aprovada').length;
  }

  get overdue(): Inspection[] {
    const today = this.localDate(new Date());
    return this.inspections().filter(
      (item) => item.status === 'Atrasada' || (item.dueDate < today && !['Aprovada', 'Reprovada', 'Cancelada'].includes(item.status)),
    );
  }

  get pendingReview(): Inspection[] {
    return this.inspections().filter((item) => item.status === 'Aguardando revisão');
  }

  get recentInspections(): Inspection[] {
    return this.inspections().slice(0, 4);
  }

  get nonconformities() {
    return this.store.records('nonconformities').filter((item) => item.status !== 'Resolvida');
  }

  get reviewOlderThan24h(): number {
    const today = this.localDate(new Date());
    return this.pendingReview.filter((item) => item.dueDate < today).length;
  }

  get canReview(): boolean {
    return this.store.hasRole(['Administrador', 'Supervisor', 'Revisor']);
  }

  get canPlan(): boolean { return this.store.hasRole(['Administrador', 'Supervisor']); }

  get chartBars(): Array<{ label: string; pending: number; running: number; completed: number }> {
    const currentDay = (new Date().getDay() + 6) % 7;
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay);
    return this.weeklyDays.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const key = this.localDate(date);
      const daily = this.inspections().filter((item) => item.dueDate === key);
      return {
        label,
        pending: daily.filter((item) => item.status === 'Planejada').length,
        running: daily.filter((item) => item.status === 'Em andamento').length,
        completed: daily.filter((item) => ['Aprovada', 'Aguardando revisão'].includes(item.status)).length,
      };
    });
  }

  countStatus(status: InspectionStatus): number {
    if (status === 'Atrasada') return this.overdue.length;
    return this.inspections().filter((item) => item.status === status).length;
  }

  chartHeight(day: { pending: number; running: number; completed: number }, key: 'pending' | 'running' | 'completed'): number {
    const max = Math.max(1, ...this.chartBars.map((item) => item.pending + item.running + item.completed));
    return Math.round((day[key] / max) * 88);
  }

  criticalityCount(severity: string): number {
    return this.nonconformities.filter((item) => item.category.toLocaleLowerCase('pt-BR').startsWith(severity.toLocaleLowerCase('pt-BR'))).length;
  }

  criticalityWidth(severity: string): number {
    const max = Math.max(1, ...this.criticalities.map((item) => this.criticalityCount(item.key)));
    return (this.criticalityCount(severity) / max) * 100;
  }

  overdueDays(inspection: Inspection): number {
    const dueDate = new Date(`${inspection.dueDate}T12:00:00`);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return Math.max(1, Math.floor((today.getTime() - dueDate.getTime()) / 86_400_000));
  }

  displayStatus(status: InspectionStatus): string {
    if (status === 'Aprovada') return 'Aprovada';
    if (status === 'Aguardando revisão') return 'Em revisão';
    if (status === 'Reprovada') return 'Correção';
    if (status === 'Atrasada') return 'Atrasada';
    if (status === 'Planejada') return 'Agendada';
    return 'Em andamento';
  }

  statusClass(status: InspectionStatus): string {
    if (status === 'Aprovada') return 'approved';
    if (status === 'Aguardando revisão') return 'reviewing';
    if (status === 'Reprovada') return 'correction';
    if (status === 'Planejada' || status === 'Atrasada') return 'pending';
    return 'running';
  }

  newInspection(): void {
    this.router.navigate(['/inspections'], { queryParams: { new: 'true' } });
  }

  openReview(): void {
    this.router.navigate(['/review']);
  }

  private localDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
