import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Equipamento } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-equipamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Equipamentos</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalEquip">
          <i class="bi bi-plus-lg"></i> Novo equipamento
        </button>
      </div>
      <table class="table table-hover">
        <thead><tr><th>Nome</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          @for (e of equipamentos(); track e.id) {
            <tr>
              <td>{{ e.nome }}</td><td>{{ e.tipo }}</td>
              <td><span class="badge" [class.bg-success]="e.status === 'ativo'"
                  [class.bg-warning]="e.status === 'manutenção'"
                  [class.bg-secondary]="e.status === 'inativo'">{{ e.status }}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="excluir(e.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="modal fade" id="modalEquip">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Novo equipamento</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="form.nome">
              <input class="form-control mb-2" placeholder="Tipo (câmera, drone, lente...)" [(ngModel)]="form.tipo">
              <select class="form-select mb-2" [(ngModel)]="form.status">
                <option value="ativo">Ativo</option><option value="manutenção">Manutenção</option>
                <option value="inativo">Inativo</option>
              </select>
              <select class="form-select mb-2" [(ngModel)]="form.localId">
                <option [value]="0">Selecione o local</option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" (click)="salvar()">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EquipamentosComponent implements OnInit {
  private api = inject(ApiService);
  equipamentos: Equipamento[] = [];
  form: Equipamento = { id: 0, nome: '', localId: 0, tipo: '', status: 'ativo' };

  ngOnInit(): void { this.api.listar<Equipamento>('equipamentos').subscribe(d => this.equipamentos = d); }
  salvar(): void { this.api.criar<Equipamento>('equipamentos', this.form).subscribe(() => { this.form = { id: 0, nome: '', localId: 0, tipo: '', status: 'ativo' }; }); }
  excluir(id: number): void { if (confirm('Excluir?')) this.api.excluir('equipamentos', id).subscribe(); }
}
