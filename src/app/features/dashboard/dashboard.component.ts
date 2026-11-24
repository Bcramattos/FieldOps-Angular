import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Inspecao, Cliente, Metrica } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Visão geral</h1>
      @for (a of alertas(); track a.texto) {
        <div class="alert mb-2 d-flex align-items-center gap-2"
             [class.alert-danger]="a.tipo === 'danger'"
             [class.alert-warning]="a.tipo === 'warning'" role="alert">
          <i class="bi" [class.bi-exclamation-octagon-fill]="a.tipo === 'danger'"
             [class.bi-exclamation-triangle-fill]="a.tipo === 'warning'"></i>
          <div>{{ a.texto }}</div>
        </div>
      }
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
        <div class="card-header"><i class="bi bi-bar-chart-fill"></i> Andamento das inspeções</div>
        <div class="card-body">
          @for (m of metricas(); track m.label) {
            <div class="mb-2">
              <div class="d-flex justify-content-between small">
                <span>{{ m.label }}</span><span>{{ m.valor }}</span>
              </div>
              <div class="progress" style="height: 22px">
                <div class="progress-bar" [class.bg-primary]="m.classe === 'primary'"
                     [class.bg-warning]="m.classe === 'warning'"
                     [class.bg-info]="m.classe === 'info'"
                     [class.bg-success]="m.classe === 'success'"
                     [class.bg-danger]="m.classe === 'danger'"
                     [style.width.%]="porcentagem(m.valor)"></div>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="card">
        <div class="card-header"><i class="bi bi-clock-history"></i> Inspeções recentes</div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead><tr><th>Código</th><th>Cliente</th><th>Técnico</th><th>Data</th><th>Prioridade</th><th>Status</th></tr></thead>
            <tbody>
              @for (i of recentes(); track i.id) {
                <tr>
                  <td>{{ i.codigo }}</td>
                  <td>{{ nomeCliente(i.clienteId) }}</td>
                  <td>{{ i.tecnico }}</td>
                  <td>{{ i.data }}</td>
                  <td><span class="badge" [class.bg-secondary]="i.prioridade === 'baixa'"
                      [class.bg-warning]="i.prioridade === 'media'"
                      [class.bg-danger]="i.prioridade === 'alta'">{{ i.prioridade }}</span></td>
                  <td><span class="badge" [class.bg-secondary]="i.status === 'Planejada'"
                      [class.bg-warning]="i.status === 'Em andamento'"
                      [class.bg-info]="i.status === 'Aguardando revisão'"
                      [class.bg-success]="i.status === 'Aprovada'"
                      [class.bg-danger]="i.status === 'Reprovada' || i.status === 'Cancelada'">{{ i.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes = signal<Inspecao[]>([]);
  clientes = signal<Cliente[]>([]);

  metricas = computed((): Metrica[] => {
    const total = this.inspecoes().length || 1;
    const por = (s: string) => this.inspecoes().filter(i => i.status === s).length;
    const nc = this.inspecoes().filter(i => (i.naoConformidades || []).length > 0).length;
    return [
      { label: 'Agendadas', valor: por('Planejada'), classe: 'primary' },
      { label: 'Em andamento', valor: por('Em andamento'), classe: 'warning' },
      { label: 'Aguardando revisão', valor: por('Aguardando revisão'), classe: 'info' },
      { label: 'Concluídas', valor: por('Aprovada'), classe: 'success' },
      { label: 'Não conformidades', valor: nc, classe: 'danger' },
    ];
  });

  alertas = computed(() => {
    const alta = this.inspecoes().filter(i => i.prioridade === 'alta' && (i.status === 'Planejada' || i.status === 'Reprovada'));
    const fila = this.inspecoes().filter(i => i.status === 'Aguardando revisão');
    const out: { tipo: string; texto: string }[] = [];
    if (alta.length) out.push({ tipo: 'danger', texto: 'Prioridade alta: ' + alta.length + ' inspecao(oes) com prioridade alta ou atrasada(s) — verificar acompanhamento.' });
    if (fila.length) out.push({ tipo: 'warning', texto: 'Atencao: ' + fila.length + ' inspecao(oes) aguardando revisao — fila pendente de aprovacao.' });
    return out;
  });

  recentes = computed(() =>
    [...this.inspecoes()].sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, 10)
  );

  ngOnInit(): void {
    this.api.listar<Inspecao>('inspecoes').subscribe(d => this.inspecoes.set(d));
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes.set(d));
  }

  porcentagem(valor: number): number {
    const total = this.inspecoes().length || 1;
    return Math.round((valor / total) * 100);
  }

  nomeCliente(id: number): string {
    return this.clientes().find(c => c.id === id)?.nome || String(id);
  }
}
