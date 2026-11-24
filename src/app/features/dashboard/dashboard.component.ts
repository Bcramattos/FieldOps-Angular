import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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


            <!-- CABEÇALHO -->
            <section class="fo-header">
                <div>
                    <span class="fo-eyebrow">FIELDOPS / OVERVIEW</span>
                    <h1>Visão geral</h1>
                    <p>Acompanhe o andamento das inspeções e as pendências da operação.</p>
                </div>

                <button *ngIf="canPlan" type="button" class="fo-primary-btn" (click)="newInspection()">
                    <i class="bi bi-plus-lg"></i>
                    Nova inspeção
                </button>
            </section>

            <!-- ALERTA OPERACIONAL -->
            <section class="fo-operation-alert">

                <div class="fo-operation-alert-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>

                <div class="fo-operation-alert-content">
                    <div class="fo-operation-alert-heading">
                        <strong>Atenção às inspeções pendentes</strong>
                    <span class="fo-operation-alert-tag">{{ overdue.length }} ATRASADAS</span>
                    </div>

                    <p>Existem {{ overdue.length }} inspeções fora do prazo e {{ reviewOlderThan24h }} inspeções aguardando revisão há mais de 24 horas.</p>
                </div>

                <a routerLink="/inspections" class="fo-operation-alert-link">
                    Ver pendências
                    <i class="bi bi-arrow-right"></i>
                </a>

            </section>

            <!-- GRÁFICO DE MÉTRICAS - CSS -->
            <section class="fo-panel fo-metrics-panel">

                <div class="fo-panel-header fo-metrics-header">
                    <div>
                        <span class="fo-eyebrow">DESEMPENHO OPERACIONAL</span>
                        <h2>Volume de inspeções</h2>
                        <p>Distribuição das atividades nos últimos 7 dias.</p>
                    </div>

                    <div class="fo-metrics-period">
                        <i class="bi bi-calendar3"></i>
                        Últimos 7 dias
                    </div>
                </div>

                <div class="fo-chart">
                    <div class="fo-chart-column" *ngFor="let day of chartBars">
                        <div class="fo-chart-bars">
                            <div class="fo-bar-segment pending" [style.height.%]="chartHeight(day, 'pending')"></div>
                            <div class="fo-bar-segment running" [style.height.%]="chartHeight(day, 'running')"></div>
                            <div class="fo-bar-segment completed" [style.height.%]="chartHeight(day, 'completed')"></div>
                        </div>
                        <span class="fo-chart-label">{{ day.label }}</span>
                    </div>
                </div>
                <div class="fo-chart-legend"><span><i class="fo-legend-dot completed"></i>Concluídas / revisão</span><span><i class="fo-legend-dot running"></i>Em andamento</span><span><i class="fo-legend-dot pending"></i>Pendentes</span></div>

            </section>

            <!-- INDICADORES -->
            <section class="fo-stats">

                <div class="fo-stat">
                    <div class="fo-stat-heading">
                        <span>Agendadas</span>
                        <i class="bi bi-calendar-event"></i>
                    </div>
                        <h2>{{ scheduledCount | number:'2.0-0' }}</h2>
                    <span class="fo-stat-foot">Inspeções programadas</span>
                </div>

                <div class="fo-stat">
                    <div class="fo-stat-heading">
                        <span>Em andamento</span>
                        <i class="bi bi-arrow-repeat"></i>
                    </div>
                        <h2>{{ inProgressCount | number:'2.0-0' }}</h2>
                    <span class="fo-stat-foot">Execuções em campo</span>
                </div>

                <div class="fo-stat">
                    <div class="fo-stat-heading">
                        <span>Aguardando revisão</span>
                        <i class="bi bi-clipboard-check"></i>
                    </div>
                        <h2>{{ reviewCount | number:'2.0-0' }}</h2>
                    <span class="fo-stat-foot">Pendentes de aprovação</span>
                </div>

                <div class="fo-stat">
                    <div class="fo-stat-heading">
                        <span>Concluídas</span>
                        <i class="bi bi-check-circle"></i>
                    </div>
                        <h2>{{ completedCount | number:'2.0-0' }}</h2>
                    <span class="fo-stat-foot">Inspeções finalizadas</span>
                </div>

            </section>

            <section class="fo-state-summary">
                <span class="fo-eyebrow">INSPEÇÕES POR ESTADO</span>
                <div class="fo-state-counts"><span *ngFor="let status of inspectionStatuses"><strong>{{ countStatus(status) }}</strong> {{ status }}</span></div>
            </section>

            <!-- ÁREA PRINCIPAL -->
            <section class="fo-main-grid">

                <!-- INSPEÇÕES ATRASADAS -->
                <div class="fo-panel fo-overdue-panel">

                    <div class="fo-panel-header">
                        <div>
                            <span class="fo-eyebrow">AÇÃO NECESSÁRIA</span>
                            <h2>Inspeções atrasadas</h2>
                            <p>Atividades que ultrapassaram o prazo.</p>
                        </div>
                        <span class="fo-count-danger">{{ overdue.length | number:'2.0-0' }}</span>
                    </div>

                    <div class="fo-overdue-list">
                        <div class="fo-overdue-item" *ngFor="let inspection of overdue.slice(0, 3)">
                            <div class="fo-overdue-icon"><i class="bi bi-clock-history"></i></div>
                            <div class="fo-item-info">
                                <strong>{{ inspection.equipment }}</strong>
                                <span>{{ inspection.location || inspection.client }}</span>
                            </div>
                            <span class="fo-delay">{{ overdueDays(inspection) }} dia(s)</span>
                        </div>
                        <div class="fo-empty-state" *ngIf="!overdue.length">Nenhuma inspeção fora do prazo.</div>
                    </div>

                    <a routerLink="/inspections" class="fo-panel-link">
                        Ver todas as atrasadas
                        <i class="bi bi-arrow-right"></i>
                    </a>

                </div>

                <!-- REVISÕES PENDENTES -->
                <div class="fo-panel fo-review-panel">

                    <div class="fo-panel-header">
                        <div>
                            <span class="fo-eyebrow">AGUARDANDO VOCÊ</span>
                            <h2>Fila de revisão</h2>
                            <p>Inspeções enviadas pelos técnicos.</p>
                        </div>
                        <span class="fo-count-neutral">{{ reviewCount | number:'2.0-0' }}</span>
                    </div>

                    <div class="fo-review-highlight">
                        <div class="fo-review-number">{{ reviewCount | number:'2.0-0' }}</div>
                        <div>
                            <strong>Inspeções pendentes</strong>
                            <span>Revisar respostas e evidências</span>
                        </div>
                    </div>

                    <div class="fo-review-meta">
                        <span>
                            <i class="bi bi-hourglass-split"></i>
                            {{ reviewOlderThan24h }} aguardando há mais de 24h
                        </span>
                    </div>

                    <a *ngIf="canReview" routerLink="/review" class="fo-review-btn">
                        Revisar inspeções
                        <i class="bi bi-arrow-right"></i>
                    </a>

                </div>

            </section>

    <section class="fo-panel fo-recent-panel">

        <div class="fo-panel-header fo-recent-header">
            <div>
                <span class="fo-eyebrow">ACOMPANHAMENTO</span>
                <h2>Inspeções recentes</h2>
                <p>Últimas atividades registradas no sistema.</p>
            </div>

            <a routerLink="/inspections" class="fo-panel-link">
                Ver todas
                <i class="bi bi-arrow-right"></i>
            </a>
        </div>

        <div class="table-responsive">
            <table class="table fo-table">
                <thead>
                    <tr>
                        <th>INSPEÇÃO</th>
                        <th>EQUIPAMENTO</th>
                        <th>RESPONSÁVEL</th>
                        <th>DATA</th>
                        <th>STATUS</th>
                    </tr>
                </thead>

                <tbody>
  <tr *ngFor="let inspection of recentInspections">
    <td><strong class="fo-inspection-code">{{ inspection.reference }}</strong></td>
    <td><strong>{{ inspection.equipment }}</strong><small>{{ inspection.location || inspection.client }}</small></td>
    <td>{{ inspection.assignedTo }}</td>
    <td>{{ inspection.dueDate | date:'d MMM, HH:mm' }}</td>
    <td><span class="fo-status" [ngClass]="statusClass(inspection.status)">{{ displayStatus(inspection.status) }}</span></td>
  </tr>
  <tr *ngIf="!recentInspections.length"><td colspan="5" class="text-center py-4">Nenhuma inspeção cadastrada.</td></tr>
</tbody>
            </table>
        </div>

    </section>


            <!-- SEGUNDA LINHA -->
            <section class="fo-secondary-grid">

                <!-- NÃO CONFORMIDADES -->
                <div class="fo-panel fo-nc-panel">

                    <div class="fo-panel-header">
                        <div>
                            <span class="fo-eyebrow">OCORRÊNCIAS</span>
                            <h2>Não conformidades</h2>
                            <p>Distribuição por criticidade</p>
                        </div>

                        <div class="fo-nc-total">
                            <strong>{{ nonconformities.length | number:'2.0-0' }}</strong>
                            <span>abertas</span>
                        </div>
                    </div>

                    <div class="fo-criticality">

                        <div class="fo-criticality-item" *ngFor="let severity of criticalities">
                            <div class="fo-criticality-info">
                                <span class="fo-criticality-label">
                                    <span class="fo-dot" [ngClass]="severity.dot"></span>
                                    {{ severity.key }}
                                </span>
                                <strong>{{ criticalityCount(severity.key) | number:'2.0-0' }}</strong>
                            </div>
                            <div class="fo-bar">
                                <div class="fo-bar-fill" [ngClass]="severity.fill" [style.width.%]="criticalityWidth(severity.key)"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
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

  nomeCliente(id: number): string { return this.clientes().find(c => c.id === id)?.nome || String(id); }


  // ===== métodos portados do Heitor (adaptados pro json-server) =====
  get canPlan(): boolean { return true; }

  get overdue(): any[] {
    return this.inspecoes().filter(i => i.status === 'Reprovada' || (i.status === 'Planejada' && i.prioridade === 'alta'));
  }

  get reviewOlderThan24h(): number {
    return this.inspecoes().filter(i => i.status === 'Aguardando revisão').length;
  }

  readonly weeklyDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly criticalities = [
    { key: 'Crítica', dot: 'critical', fill: 'critical-fill' },
    { key: 'Alta', dot: 'high', fill: 'high-fill' },
    { key: 'Média', dot: 'medium', fill: 'medium-fill' },
    { key: 'Baixa', dot: 'low', fill: 'low-fill' },
  ];

  get chartBars(): any[] {
    // distribuição semanal das inspeções (do json-server):
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
    const val = (day[tipo] || 0) * 20;
    return Math.min(val, 100);
  }

  newInspection(): void {
    this.router.navigate(['/planejamento']);
  }

  porcentagem(valor: number): number {
    const total = this.inspecoes().length || 1;
    return Math.round((valor / total) * 100);
  }
  nomeEquipamento(id: number): string { return String(id); }
}