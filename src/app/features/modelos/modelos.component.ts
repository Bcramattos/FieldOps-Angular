import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ChecklistModelo } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Modelos de checklist</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalModelo">
          <i class="bi bi-plus-lg"></i> Novo modelo
        </button>
      </div>

      <div class="row g-3">
        @for (m of modelos; track m.id) {
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ m.nome }}</h5>
                <p class="card-text">{{ m.descricao }}</p>
                <div class="d-flex gap-2 mb-3">
                  <span class="badge bg-secondary">{{ m.qtdItens }} itens</span>
                  <span class="badge" [class.bg-warning]="m.status === 'rascunho'"
                        [class.bg-success]="m.status === 'publicado'">
                    v{{ m.versao }} — {{ m.status }}
                  </span>
                </div>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary" (click)="editar(m)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="duplicar(m)"><i class="bi bi-files"></i></button>
                  @if (m.status === 'rascunho') {
                    <button class="btn btn-sm btn-outline-success" (click)="publicar(m)"><i class="bi bi-upload"></i> Publicar</button>
                  }
                  <button class="btn btn-sm btn-outline-danger ms-auto" (click)="excluir(m.id)"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="modal fade" id="modalModelo">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} modelo</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <input class="form-control mb-2" placeholder="Nome do checklist" [(ngModel)]="form.nome">
              <textarea class="form-control mb-2" rows="2" placeholder="Descrição" [(ngModel)]="form.descricao"></textarea>
              <input type="number" class="form-control mb-2" placeholder="Qtd de itens" [(ngModel)]="form.qtdItens">
              <input class="form-control mb-2" placeholder="Versão (ex: 1.0)" [(ngModel)]="form.versao">
              <select class="form-select" [(ngModel)]="form.status">
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
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
export class ModelosComponent implements OnInit {
  private api = inject(ApiService);
  modelos: ChecklistModelo[] = [];
  editando = false;
  form: ChecklistModelo = { id: 0, nome: '', descricao: '', qtdItens: 0, versao: '1.0', status: 'rascunho' };

  ngOnInit(): void { this.api.listar<ChecklistModelo>('modelos').subscribe(d => this.modelos = d); }

  editar(m: ChecklistModelo): void {
    this.form = { ...m };
    this.editando = true;
    document.getElementById('modalModelo')?.click();
  }

  duplicar(m: ChecklistModelo): void {
    this.api.criar<ChecklistModelo>('modelos', { ...m, id: 0, nome: m.nome + ' (cópia)', status: 'rascunho', versao: '1.0' })
      .subscribe(() => this.recarregar());
  }

  publicar(m: ChecklistModelo): void {
    this.api.editar<ChecklistModelo>('modelos', m.id, { status: 'publicado' }).subscribe(() => this.recarregar());
  }

  excluir(id: number): void {
    if (confirm('Excluir modelo?')) this.api.excluir('modelos', id).subscribe(() => this.recarregar());
  }

  salvar(): void {
    if (this.editando) {
      this.api.editar<ChecklistModelo>('modelos', this.form.id, this.form).subscribe(() => this.recarregar());
    } else {
      this.api.criar<ChecklistModelo>('modelos', this.form).subscribe(() => this.recarregar());
    }
  }

  recarregar(): void {
    this.form = { id: 0, nome: '', descricao: '', qtdItens: 0, versao: '1.0', status: 'rascunho' };
    this.editando = false;
    this.api.listar<ChecklistModelo>('modelos').subscribe(d => this.modelos = d);
  }
}
