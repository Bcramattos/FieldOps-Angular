import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Cliente, Local, Equipamento, ChecklistModelo } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-planejamento',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Planejamento de inspeção</h1>
      <div class="card p-4" style="max-width: 640px">
        <div class="mb-3">
          <label class="form-label">Cliente</label>
          <select class="form-select" [(ngModel)]="form.clienteId" (ngModelChange)="atualizarLocais()">
            @for (c of clientes; track c.id) { <option [value]="c.id">{{ c.nome }}</option> }
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Local</label>
          <select class="form-select" [(ngModel)]="form.localId" (ngModelChange)="atualizarEquipamentos()">
            @for (l of locaisFiltrados(); track l.id) { <option [value]="l.id">{{ l.nome }}</option> }
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Equipamento</label>
          <select class="form-select" [(ngModel)]="form.equipamentoId">
            @for (e of equipamentosFiltrados(); track e.id) { <option [value]="e.id">{{ e.nome }}</option> }
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Modelo de checklist</label>
          <select class="form-select" [(ngModel)]="form.checklistModeloId">
            @for (m of modelos; track m.id) { <option [value]="m.id">{{ m.nome }}</option> }
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Técnico responsável</label>
          <input class="form-control" [(ngModel)]="form.tecnico">
        </div>
        <div class="mb-3">
          <label class="form-label">Data da inspeção</label>
          <input type="date" class="form-control" [(ngModel)]="form.data">
        </div>
        <div class="mb-3">
          <label class="form-label">Prioridade</label>
          <select class="form-select" [(ngModel)]="form.prioridade">
            <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Observações</label>
          <textarea class="form-control" rows="3" [(ngModel)]="form.observacoes"></textarea>
        </div>
        <button class="btn btn-primary" (click)="salvar()"><i class="bi bi-calendar-plus"></i> Planejar inspeção</button>
      </div>
    </div>
  `
})
export class PlanejamentoComponent implements OnInit {
  private api = inject(ApiService);
  clientes: Cliente[] = [];
  locais: Local[] = [];
  equipamentos: Equipamento[] = [];
  modelos: ChecklistModelo[] = [];

  form = {
    clienteId: 0, localId: 0, equipamentoId: 0, checklistModeloId: 0,
    tecnico: '', data: '', prioridade: 'media', observacoes: '',
    status: 'Planejada' as const, codigo: ''
  };

  ngOnInit(): void {
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d);
    this.api.listar<Local>('locais').subscribe(d => this.locais = d);
    this.api.listar<Equipamento>('equipamentos').subscribe(d => this.equipamentos = d);
    this.api.listar<ChecklistModelo>('modelos').subscribe(d => this.modelos = d);
  }

  locaisFiltrados(): Local[] { return this.locais.filter(l => !this.form.clienteId || l.clienteId === this.form.clienteId); }
  equipamentosFiltrados(): Equipamento[] { return this.equipamentos.filter(e => !this.form.localId || e.localId === this.form.localId); }
  atualizarLocais(): void { this.form.localId = 0; this.form.equipamentoId = 0; }
  atualizarEquipamentos(): void { this.form.equipamentoId = 0; }

  salvar(): void {
    this.form.codigo = 'INS-' + Date.now().toString().slice(-6);
    this.api.criar('inspecoes', this.form).subscribe(() => {
      this.form = { clienteId: 0, localId: 0, equipamentoId: 0, checklistModeloId: 0,
        tecnico: '', data: '', prioridade: 'media', observacoes: '',
        status: 'Planejada' as const, codigo: '' };
    });
  }
}
