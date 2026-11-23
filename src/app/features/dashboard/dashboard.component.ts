import { Component, OnInit, inject } from '@angular/core';
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

      <!-- ALERTAS PRIORITÁRIOS -->
      @for (a of alertas(); track a.texto) {
        <div class="alert mb-2 d-flex align-items-center gap-2"
             [class.alert-danger]="a.tipo === 'danger'"
             [class.alert-warning]="a.tipo === 'warning'" role="alert">
          <i class="bi" [class.bi-exclamation-octagon-fill]="a.tipo === 'danger'"
             [class.bi-exclamation-triangle-fill]="a.tipo === 'warning'"></i>
          <div>{{ a.texto }}</div>
        </div>
      }

      <!-- CARDS DE INDICADORES -->
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

      <!-- GRÁFICO DE ANDAMENTO (CSS puro) -->
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
                     [style.width.%]="porcentagem(m.valor)"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- INSPEÇÕES RECENTES -->
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
  inspecoes: Inspecao[] = [];
  clientes: Cliente[] = [];

  ngOnInit(): void {
    this.api.listar<Inspecao>('inspecoes').subscribe(d => this.inspecoes = d);
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d);
  }

  metricas() {
    const total = this.inspecoes.length || 1;
    const agendadas = this.inspecoes.filter(i => i.status === 'Planejada').length;
    const andamento = this.inspecoes.filter(i => i.status === 'Em andamento').length;
    const revisao = this.inspecoes.filter(i => i.status === 'Aguardando revisão').length;
    const concluidas = this.inspecoes.filter(i => i.status === 'Aprovada').length;
    const nc = this.inspecoes.filter(i => (i.naoConformidades || []).length > 0).length;
    return [
      { label: 'Agendadas', valor: agendadas, classe: 'primary' },
      { label: 'Em andamento', valor: andamento, classe: 'warning' },
      { label: 'Aguardando revisão', valor: revisao, classe: 'info' },
      { label: 'Concluídas', valor: concluidas, classe: 'success' },
      { label: 'Não conformidades', valor: nc, classe: 'danger' },
    ];
  }

  alertas() {
    const atrasadas = this.inspecoes.filter(i => i.status === 'Reprovada' || (i.status === 'Planejada' && i.prioridade === 'alta'));
    const revisao = this.inspecoes.filter(i => i.status === 'Aguardando revisão');
    const out = [];
    if (atrasadas.length) out.push({ tipo: 'danger', texto: `Prioridade alta: ${atrasadas.length} inspeção(ões) atrasada(s) ou com prioridade alta — verificar acompanhamento.` });
    if (revisao.length) out.push({ tipo: 'warning', texto: `Atenção: ${revisao.length} inspeção(ões) aguardando revisão — fila pendente de aprovação.` });
    return out;
  }

  recentes() {
    return [...this.inspecoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10);
  }

  porcentagem(valor: number): number {
    const total = this.inspecoes.length || 1;
    return Math.round((valor / total) * 100);
  }

  nomeCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nome || String(id);
  }
}
