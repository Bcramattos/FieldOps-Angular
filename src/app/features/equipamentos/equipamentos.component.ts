import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-equipamentos',
  standalone: true,
  imports: [],
  template: `
    <h1 class="h3 mb-4">Equipamentos</h1>

    <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalEquipamentos">
      <i class="bi bi-plus-lg"></i> Novo
    </button>

    <table class="table table-hover">
      <thead><tr><th>{{ "Nome" }}</th><th>{{ "Local ID" }}</th><th>{{ "Tipo" }}</th><th>{{ "Status" }}</th><th></th></tr></thead>
      <tbody>
        @for (item of itens(); track item.id) {
          <tr>
            <td>{{ item.nome }}</td><td>{{ item.localId }}</td><td>{{ item.tipo }}</td><td>{{ item.status }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" (click)="excluir(item.id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        }
      </tbody>
    </table>

    <!-- Modal -->
    <div class="modal fade" id="modalEquipamentos">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Novo Equipamento</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="novo.nome"><input class="form-control mb-2" placeholder="Local ID" [(ngModel)]="novo.localId"><input class="form-control mb-2" placeholder="Tipo" [(ngModel)]="novo.tipo"><input class="form-control mb-2" placeholder="Status" [(ngModel)]="novo.status">
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EquipamentosComponent implements OnInit {
  private api = inject(ApiService);
  itens: any[] = [];
  novo: any = {};

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.listar('equipamentos').subscribe(d => this.itens = d);
  }

  salvar(): void {
    this.api.criar('equipamentos', this.novo).subscribe(() => {
      this.novo = {};
      this.carregar();
    });
  }

  excluir(id: number): void {
    this.api.excluir('equipamentos', id).subscribe(() => this.carregar());
  }
}
