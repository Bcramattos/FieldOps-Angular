import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [],
  template: `
    <h1 class="h3 mb-4">Clientes</h1>

    <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalClientes">
      <i class="bi bi-plus-lg"></i> Novo
    </button>

    <table class="table table-hover">
      <thead><tr><th>{{ "Nome" }}</th><th>{{ "CNPJ" }}</th><th>{{ "Email" }}</th><th>{{ "Telefone" }}</th><th></th></tr></thead>
      <tbody>
        @for (item of itens(); track item.id) {
          <tr>
            <td>{{ item.nome }}</td><td>{{ item.cnpj }}</td><td>{{ item.email }}</td><td>{{ item.telefone }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" (click)="excluir(item.id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        }
      </tbody>
    </table>

    <!-- Modal -->
    <div class="modal fade" id="modalClientes">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Novo Cliente</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="novo.nome"><input class="form-control mb-2" placeholder="CNPJ" [(ngModel)]="novo.cnpj"><input class="form-control mb-2" placeholder="Email" [(ngModel)]="novo.email"><input class="form-control mb-2" placeholder="Telefone" [(ngModel)]="novo.telefone">
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
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);
  itens: any[] = [];
  novo: any = {};

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.listar('clientes').subscribe(d => this.itens = d);
  }

  salvar(): void {
    this.api.criar('clientes', this.novo).subscribe(() => {
      this.novo = {};
      this.carregar();
    });
  }

  excluir(id: number): void {
    this.api.excluir('clientes', id).subscribe(() => this.carregar());
  }
}
