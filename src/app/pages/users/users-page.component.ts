import { Component, inject } from '@angular/core';
import { DemoRole, Inspection, UserRecord } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({ selector: 'app-users-page', standalone: false, templateUrl: './users-page.component.html', styleUrl: '../../theme/original/dashboard.css' })
export class UsersPageComponent {
  private readonly store = inject(FieldOpsStore);
  readonly users = this.store.users;
  query = '';
  roleFilter = '';
  statusFilter = '';
  modalOpen = false;
  relatedUser: UserRecord | null = null;
  resetTarget: UserRecord | null = null;
  editingId: string | null = null;
  notice = '';
  draft = this.emptyDraft();
  readonly roles: DemoRole[] = ['Administrador', 'Supervisor', 'Técnico', 'Revisor'];
  get filteredUsers(): UserRecord[] { const q = this.query.trim().toLocaleLowerCase('pt-BR'); return this.users().filter((u) => (!q || [u.name,u.email,u.phone,u.unit].some((s) => s.toLocaleLowerCase('pt-BR').includes(q))) && (!this.roleFilter || u.role === this.roleFilter) && (!this.statusFilter || u.status === this.statusFilter)); }
  get activeCount(): number { return this.users().filter((u) => u.status === 'Ativo').length; }
  get resetPendingCount(): number { return this.users().filter((u) => u.resetPending).length; }
  relatedInspections(user: UserRecord): Inspection[] { return this.store.inspections().filter((i) => i.technicianId === user.id || i.assignedTo === user.name); }
  create(): void { this.editingId = null; this.draft = this.emptyDraft(); this.modalOpen = true; }
  edit(user: UserRecord): void { this.editingId = user.id; this.draft = { name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status, unit: user.unit }; this.modalOpen = true; }
  save(): void { if (!this.draft.name.trim() || !this.draft.email.trim()) return; this.store.saveUserRecord({ ...this.draft, name: this.draft.name.trim(), email: this.draft.email.trim(), phone: this.draft.phone.trim(), unit: this.draft.unit.trim() }, this.editingId ?? undefined); this.notice = this.editingId ? 'Dados do usuário atualizados.' : 'Usuário cadastrado.'; this.modalOpen = false; }
  toggleStatus(user: UserRecord): void { const next = user.status === 'Ativo' ? 'Inativo' : 'Ativo'; this.store.updateUserStatus(user.id, next); this.notice = `Acesso ${next.toLocaleLowerCase('pt-BR')}.`; }
  block(user: UserRecord): void { this.store.updateUserStatus(user.id, user.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado'); this.notice = user.status === 'Bloqueado' ? 'Acesso desbloqueado.' : 'Acesso bloqueado.'; }
  reset(user: UserRecord): void { this.resetTarget = user; }
  confirmReset(): void { if (!this.resetTarget) return; this.store.requestUserReset(this.resetTarget.id); this.notice = `Solicitação de redefinição registrada para ${this.resetTarget.email}.`; this.resetTarget = null; }
  showRelated(user: UserRecord): void { this.relatedUser = user; }
  statusClass(status: UserRecord['status']): string { return status === 'Ativo' ? 'text-bg-success' : status === 'Inativo' ? 'text-bg-secondary' : 'text-bg-danger'; }
  private emptyDraft(): Omit<UserRecord, 'id' | 'createdAt' | 'resetPending'> { return { name: '', email: '', phone: '', role: 'Técnico', status: 'Ativo', unit: '' }; }
}
