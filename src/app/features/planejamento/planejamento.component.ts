import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-planejamento',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1 class="h3 mb-4">Planejamento de inspeção</h1>
    <form (ngSubmit)="salvar()" class="card p-4" style="max-width: 640px">
      <div class="mb-3">
        <label class="form-label">Cliente</label>
        <select class="form-select" [(ngModel)]="form.clienteId" name="clienteId" required>
          <option *ngFor="let c of clientes" [value]="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Local</label>
        <select class="form-select" [(ngModel)]="form.localId" name="localId" required>
          <option *ngFor="let l of locais" [value]="l.id">{{ l.nome }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Equipamento</label>
        <select class="form-select" [(ngModel)]="form.equipamentoId" name="equipamentoId" required>
          <option *ngFor="let e of equipamentos" [value]="e.id">{{ e.nome }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Modelo de checklist</label>
        <select class="form-select" [(ngModel)]="form.checklistModeloId" name="modeloId" required>
          <option *ngFor="let m of modelos" [value]="m.id">{{ m.nome }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Técnico responsável</label>
        <input class="form-control" [(ngModel)]="form.tecnico" name="tecnico" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Data da inspeção</label>
        <input type="date" class="form-control" [(ngModel)]="form.data" name="data" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Prioridade</label>
        <select class="form-select" [(ngModel)]="form.prioridade" name="prioridade">
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Observações</label>
        <textarea class="form-control" rows="3" [(ngModel)]="form.observacoes" name="obs"></textarea>
      </div>
      <button class="btn btn-primary" type="submit">
        <i class="bi bi-calendar-plus"></i> Planejar inspeção
      </button>
    </form>
  `
})
export class PlanejamentoComponent implements OnInit {
  private api = inject(ApiService);
  clientes: any[] = [];
  locais: any[] = [];
  equipamentos: any[] = [];
  modelos: any[] = [];

  form = {
    clienteId: 0, localId: 0, equipamentoId: 0, checklistModeloId: 0,
    tecnico: '', data: '', prioridade: 'media', observacoes: '',
    status: 'Planejada', codigo: ''
  };

  ngOnInit(): void {
    this.api.listar('clientes').subscribe(d => this.clientes = d);
    this.api.listar('locais').subscribe(d => this.locais = d);
    this.api.listar('equipamentos').subscribe(d => this.equipamentos = d);
    this.api.listar('modelos').subscribe(d => this.modelos = d);
  }

  salvar(): void {
    this.form.codigo = 'INS-' + Date.now().toString().slice(-6);
    this.api.criar('inspecoes', this.form).subscribe(() => {
      this.form = { ...this.form, clienteId: 0, localId: 0, equipamentoId: 0,
                    checklistModeloId: 0, tecnico: '', data: '', observacoes: '' };
    });
  }
}
