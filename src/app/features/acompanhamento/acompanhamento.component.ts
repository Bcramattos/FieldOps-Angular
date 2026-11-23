import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  template: `
    <h1 class="h3 mb-4">Acompanhamento das inspeções</h1>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <select class="form-select" [(ngModel)]="filtroStatus">
          <option value="">Todos os status</option>
          <option>Planejada</option><option>Em andamento</option>
          <option>Aguardando revisão</option><option>Aprovada</option>
          <option>Reprovada</option><option>Cancelada</option>
        </select>
      </div>
      <div class="col-md-3">
        <select class="form-select" [(ngModel)]="filtroTecnico">
          <option value="">Todos os técnicos</option>
          @for (t of tecnicos(); track t) { <option>{{ t }}</option> }
        </select>
      </div>
    </div>

    <table class="table table-hover">
      <thead><tr><th>Código</th><th>Cliente</th><th>Equipamento</th><th>Técnico</th><th>Data</th><th>Prioridade</th><th>Status</th></tr></thead>
      <tbody>
        @for (i of filtradas(); track i.id) {
          <tr>
            <td><a [routerLink]="['/revisao', i.id]">{{ i.codigo }}</a></td>
            <td>{{ i.clienteId }}</td><td>{{ i.equipamentoId }}</td>
            <td>{{ i.tecnico }}</td><td>{{ i.data }}</td><td>{{ i.prioridade }}</td>
            <td><span class="badge" [class.bg-secondary]="i.status === 'Planejada'"
                [class.bg-warning]="i.status === 'Em andamento'"
                [class.bg-info]="i.status === 'Aguardando revisão'"
                [class.bg-success]="i.status === 'Aprovada'"
                [class.bg-danger]="i.status === 'Reprovada' || i.status === 'Cancelada'">{{ i.status }}</span></td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class AcompanhamentoComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes: any[] = [];
  filtroStatus = signal('');
  filtroTecnico = signal('');

  tecnicos = computed(() => [...new Set(this.inspecoes.map(i => i.tecnico))]);
  filtradas = computed(() => this.inspecoes.filter(i =>
    (!this.filtroStatus() || i.status === this.filtroStatus()) &&
    (!this.filtroTecnico() || i.tecnico === this.filtroTecnico())));

  ngOnInit(): void {
    this.api.listar('inspecoes').subscribe(d => this.inspecoes = d);
  }
}
//essa tela é do acompanhamento