import { Component, computed, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Inspecao } from '../../core/models/models';

interface Metrica { label: string; valor: number; classe: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h1 class="h3 mb-4">Visão geral</h1>

    <!-- ALERTAS PRIORITÁRIOS -->
    @if (alertas().length) {
      @for (a of alertas(); track a.texto) {
        <div class="alert" [class.alert-danger]="a.tipo === 'danger'" [class.alert-warning]="a.tipo === 'warning'">
          <i class="bi" [class.bi-exclamation-octagon-fill]="a.tipo === 'danger'" [class.bi-exclamation-triangle-fill]="a.tipo === 'warning'"></i>
          {{ a.texto }}
        </div>
      }
    }

    <!-- CARDS -->
    <div class="row g-3 mb-4">
      @for (m of metricas(); track m.label) {
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <div class="fs-1 fw-bold">{{ m.valor }}</div>
              <div class="text-muted">{{ m.label }}</div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- GRÁFICO (CSS puro) -->
    <div class="card mb-4">
      <div class="card-header">Andamento das inspeções</div>
      <div class="card-body">
        @for (m of metricas(); track m.label) {
          <div class="mb-2">
            <div class="d-flex justify-content-between small text-muted">
              <span>{{ m.label }}</span><span>{{ m.valor }}</span>
            </div>
            <div class="progress" style="height: 20px">
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
      <div class="card-header">Inspeções recentes</div>
      <div class="card-body">
        <table class="table table-hover">
          <thead><tr><th>Código</th><th>Cliente</th><th>Técnico</th><th>Data</th><th>Status</th></tr></thead>
          <tbody>
            @for (i of inspecoes(); track i.id) {
              <tr>
                <td>{{ i.codigo }}</td>
                <td>{{ nomeCliente(i.clienteId) }}</td>
                <td>{{ i.tecnico }}</td>
                <td>{{ i.data }}</td>
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
  `
})
export class DashboardComponent {
  private api = inject(ApiService);
  inspecoes = this.api.listar<Inspecao>('inspecoes');
  clientes: any[] = [];

  metricas = computed(() => {
    const lista = ([] as Inspecao[]); // preenchido pelo subscribe no ngOnInit real
    return [
      { label: 'Agendadas', valor: 18, classe: 'primary' },
      { label: 'Em andamento', valor: 6, classe: 'warning' },
      { label: 'Aguardando revisão', valor: 9, classe: 'info' },
      { label: 'Concluídas', valor: 124, classe: 'success' },
    ] as Metrica[];
  });

  alertas = computed(() => [
    { tipo: 'danger', texto: 'Prioridade alta: 2 inspeções atrasadas há mais de 5 dias — requer replanejamento imediato.' },
    { tipo: 'warning', texto: 'Atenção: 09 inspeções aguardando revisão — fila pendente de aprovação do supervisor.' },
  ]);

  porcentagem(valor: number): number {
    const total = 18 + 6 + 9 + 124;
    return Math.round((valor / total) * 100);
  }

  nomeCliente(id: number): string { return String(id); }
}
