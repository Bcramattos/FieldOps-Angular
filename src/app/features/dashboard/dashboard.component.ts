import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Inspecao, Cliente, Metrica } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  styleUrl: '../../theme/original/dashboard.css',
  template: `
    <main class="dashboard">
      <section class="fo-header">
        <div>
          <span class="fo-eyebrow">FIELDOPS / OVERVIEW</span>
          <h1>Visão geral</h1>
          <p>Acompanhe o andamento das inspeções e as pendências da operação.</p>
        </div>
        <button type="button" class="fo-primary-btn" (click)="newInspection()">
          <i class="bi bi-plus-lg"></i> Nova inspeção
        </button>
      </section>

      <section class="fo-operation-alert">
        <div class="fo-operation-alert-icon"><i class="bi bi-exclamation-triangle"></i></div>
        <div class="fo-operation-alert-content">
          <div class="fo-operation-alert-heading">
            <strong>Atenção às inspeções pendentes</strong>
            <span class="fo-operation-alert-tag">{{ overdue.length }} ATRASADAS</span>
          </div>
          <p>Existem {{ overdue.length }} inspeções fora do prazo e {{ reviewCount }} aguardando revisão.</p>
        </div>
        <a routerLink="/acompanhamento" class="fo-operation-alert-link">Ver pendências <i class="bi bi-arrow-right"></i></a>
      </section>

      <section class="fo-panel fo-metrics-panel">
        <div class="fo-panel-header fo-metrics-header">
          <div>
            <span class="fo-eyebrow">DESEMPENHO OPERACIONAL</span>
            <h2>Volume de inspeções</h2>
            <p>Distribuição das atividades nos últimos 7 dias.</p>
          </div>
        </div>
        <div class="fo-chart">
          @for (day of chartBars; track day.label) {
            <div class="fo-chart-column">
              <div class="fo-chart-bars">
                <div class="fo-bar-segment pending" [style.height.%]="chartHeight(day, 'pending')"></div>
                <div class="fo-bar-segment running" [style.height.%]="chartHeight(day, 'running')"></div>
                <div class="fo-bar-segment completed" [style.height.%]="chartHeight(day, 'completed')"></div>
              </div>
              <span class="fo-chart-label">{{ day.label }}</span>
            </div>
          }
        </div>
      </section>

      <div class="row g-3 mb-4">
        @for (m of metricas(); track m.label) {
          <div class="col-md-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <div class="display-6 fw-bold">{{ m.valor }}</div>
                <div class="text-muted">{{ m.label }}</div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="card mb-4">
        <div class="card-header"><i class="bi bi-clock-history"></i> Inspeções recentes</div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead><tr><th>Código</th><th>Cliente</th><th>Técnico</th><th>Data</th><th>Status</th></tr></thead>
            <tbody>
              @for (i of recentes(); track i.id) {
                <tr>
                  <td>{{ i.codigo }}</td>
                  <td>{{ nomeCliente(i.clienteId) }}</td>
                  <td>{{ i.tecnico }}</td>
                  <td>{{ i.data }}</td>
                  <td><span class="badge" [class.bg-success]="i.status === 'Aprovada'"
                      [class.bg-danger]="i.status === 'Reprovada'"
                      [class.bg-warning]="i.status === 'Em andamento'"
                      [class.bg-info]="i.status === 'Aguardando revisão'">{{ i.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  inspecoes = signal<Inspecao[]>([]);
  clientes = signal<Cliente[]>([]);

  ngOnInit(): void {
    this.api.listar<Inspecao>('inspecoes').subscribe(d => this.inspecoes.set(d));
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes.set(d));
  }

  get canPlan(): boolean { return true; }
  get overdue(): any[] { return this.inspecoes().filter(i => i.status === 'Reprovada'); }
  newInspection(): void { this.router.navigate(['/planejamento']); }

  get scheduledCount(): number { return this.inspecoes().filter(i => i.status === 'Planejada').length; }
  get inProgressCount(): number { return this.inspecoes().filter(i => i.status === 'Em andamento').length; }
  get reviewCount(): number { return this.inspecoes().filter(i => i.status === 'Aguardando revisão').length; }

  readonly weeklyDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  get chartBars(): any[] {
    const bars = [];
    const hoje = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toISOString().slice(0, 10);
      const doDia = this.inspecoes().filter(ins => ins.data === dayStr);
      bars.push({
        label: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][(d.getDay() + 6) % 7],
        pending: doDia.filter(x => x.status === 'Planejada').length,
        running: doDia.filter(x => x.status === 'Em andamento').length,
        completed: doDia.filter(x => x.status === 'Aprovada').length,
      });
    }
    return bars;
  }

  chartHeight(day: any, tipo: string): number {
    return Math.min((day[tipo] || 0) * 20, 100);
  }

  newInspectionNav(): void { this.router.navigate(['/planejamento']); }

  metricas(): Metrica[] {
    const total = this.inspecoes.length || 1;
    const por = (s: string) => this.inspecoes().filter(i => i.status === s).length;
    const nc = this.inspecoes().filter(i => (i.naoConformidades || []).length > 0).length;
    return [
      { label: 'Agendadas', valor: por('Planejada'), classe: 'primary' },
      { label: 'Em andamento', valor: por('Em andamento'), classe: 'warning' },
      { label: 'Aguardando revisão', valor: por('Aguardando revisão'), classe: 'info' },
      { label: 'Concluídas', valor: por('Aprovada'), classe: 'success' },
      { label: 'Não conformidades', valor: nc, classe: 'danger' },
    ];
  }

  recentes(): any[] {
    return [...this.inspecoes()].sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, 10);
  }

  porcentagem(valor: number): number {
    return Math.round((valor / (this.inspecoes.length || 1)) * 100);
  }

  nomeCliente(id: number): string {
    return this.clientes().find(c => c.id === id)?.nome || String(id);
  }

  newInspectionRedirect(): void { this.router.navigate(['/planejamento']); }
}
