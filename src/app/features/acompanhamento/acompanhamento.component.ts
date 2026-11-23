import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Inspecao, Cliente } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Acompanhamento das inspeções</h1>

      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroStatus">
            <option value="">Todos os status</option>
            @for (s of statusList; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroTecnico">
            <option value="">Todos os técnicos</option>
            @for (t of tecnicos; track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroCliente">
            <option value="">Todos os clientes</option>
            @for (c of clientes; track c.id) { <option [value]="c.id">{{ c.nome }}</option> }
          </select>
        </div>
      </div>

      <table class="table table-hover">
        <thead><tr><th>Código</th><th>Cliente</th><th>Técnico</th><th>Data</th><th>Prioridade</th><th>Status</th><th></th></tr></thead>
        <tbody>
          @for (i of filtradas(); track i.id) {
            <tr>
              <td><a [routerLink]="['/revisao', i.id]">{{ i.codigo }}</a></td>
              <td>{{ nomeCliente(i.clienteId) }}</td>
              <td>{{ i.tecnico }}</td><td>{{ i.data }}</td>
              <td><span class="badge" [class.bg-secondary]="i.prioridade === 'baixa'"
                  [class.bg-warning]="i.prioridade === 'media'"
                  [class.bg-danger]="i.prioridade === 'alta'">{{ i.prioridade }}</span></td>
              <td><span class="badge" [class.bg-secondary]="i.status === 'Planejada'"
                  [class.bg-warning]="i.status === 'Em andamento'"
                  [class.bg-info]="i.status === 'Aguardando revisão'"
                  [class.bg-success]="i.status === 'Aprovada'"
                  [class.bg-danger]="i.status === 'Reprovada' || i.status === 'Cancelada'">{{ i.status }}</span></td>
              <td><a class="btn btn-sm btn-outline-primary" [routerLink]="['/revisao', i.id]"><i class="bi bi-eye"></i> Revisar</a></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class AcompanhamentoComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes: Inspecao[] = [];
  clientes: Cliente[] = [];
  filtroStatus = '';
  filtroTecnico = '';
  filtroCliente = '';

  statusList = ['Planejada', 'Em andamento', 'Aguardando revisão', 'Aprovada', 'Reprovada', 'Cancelada'];

  ngOnInit(): void {
    this.api.listar<Inspecao>('inspecoes').subscribe(d => this.inspecoes = d);
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d);
  }

  tecnicos(): string[] {
    return [...new Set(this.inspecoes.map(i => i.tecnico))];
  }

  filtradas(): Inspecao[] {
    return this.inspecoes.filter(i =>
      (!this.filtroStatus || i.status === this.filtroStatus) &&
      (!this.filtroTecnico || i.tecnico === this.filtroTecnico) &&
      (!this.filtroCliente || String(i.clienteId) === String(this.filtroCliente)));
  }

  nomeCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nome || String(id);
  }
}
//essa tela é do acompanhamento