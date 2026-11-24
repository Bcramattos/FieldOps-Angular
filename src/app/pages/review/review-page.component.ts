import { Component, inject } from '@angular/core';
import { Inspection, InspectionStatus } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({
  selector: 'app-review-page',
  standalone: false,
  templateUrl: './review-page.component.html',
  styleUrl: '../../theme/original/dashboard.css',
})
export class ReviewPageComponent {
  private readonly store = inject(FieldOpsStore);
  readonly inspections = this.store.inspections;
  selectedId = 'insp-02';
  note = '';
  notice = '';
  decision: 'Aprovada' | 'Reprovada' | null = null;
  confirmOpen = false;
  error = '';

  get queue(): Inspection[] { return this.inspections().filter((item) => item.status === 'Aguardando revisão'); }
  get reviewable(): Inspection[] { return this.inspections().filter((item) => item.status !== 'Planejada' && item.status !== 'Cancelada'); }
  get selected(): Inspection | null { return this.inspections().find((item) => item.id === this.selectedId) ?? this.queue[0] ?? null; }
  get canReview(): boolean { return this.store.hasRole(['Administrador', 'Supervisor', 'Revisor']); }
  get approvedCount(): number { return this.inspections().filter((item) => item.status === 'Aprovada').length; }
  get rejectedCount(): number { return this.inspections().filter((item) => item.status === 'Reprovada').length; }
  get reviewedPercent(): number { const total = this.inspections().length; return total ? Math.round(((this.approvedCount + this.rejectedCount) / total) * 100) : 0; }
  get nonconformities() { return (this.selected?.answers ?? []).filter((answer) => answer.nonconformity); }
  get evidence(): Array<{ name: string; question: string }> { return (this.selected?.answers ?? []).flatMap((answer) => (answer.evidence ?? []).map((name) => ({ name, question: answer.question }))); }
  get answerCount(): number { return this.selected?.answers?.length ?? 0; }
  get conformingCount(): number { return (this.selected?.answers ?? []).filter((answer) => { const response = answer.response.toLocaleLowerCase('pt-BR').trim(); return response.includes('conforme') && !response.includes('não conforme'); }).length; }
  get resultPercent(): number { return this.answerCount ? Math.round((this.conformingCount / this.answerCount) * 100) : (this.selected?.progress ?? 0); }
  modelLabel(inspection: Inspection): string { const model = this.store.models().find((item) => item.id === inspection.modelId); return model ? `${model.title} v${inspection.modelVersion ?? model.version}` : 'Modelo de inspeção'; }

  statusClass(status: InspectionStatus): string {
    if (status === 'Aprovada') return 'completed';
    if (status === 'Aguardando revisão' || status === 'Planejada') return 'pending';
    if (status === 'Reprovada' || status === 'Atrasada' || status === 'Cancelada') return 'stopped';
    return 'running';
  }
  beginDecision(status: 'Aprovada' | 'Reprovada'): void {
    if (!this.canReview || this.selected?.status !== 'Aguardando revisão') return;
    this.decision = status; this.error = ''; this.confirmOpen = true;
  }
  confirmDecision(): void {
    const item = this.selected;
    if (!item || !this.decision || !this.canReview) return;
    if (this.decision === 'Reprovada' && !this.note.trim()) { this.error = 'Informe o motivo da reprovação para devolver ao técnico.'; return; }
    const state = this.decision;
    this.store.updateInspection(item.id, state, state === 'Aprovada' ? 100 : undefined, this.note.trim());
    this.notice = `${item.reference} ${state.toLocaleLowerCase('pt-BR')} e decisão registrada no histórico.`;
    this.confirmOpen = false; this.decision = null; this.note = ''; this.error = '';
  }
  formatDateTime(value?: string): string { return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'; }
}
