import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-locais',
  standalone: true,
  imports: [],
  template: `
    <h1 class="h3 mb-4">Locais</h1>

    <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalLocais">
      <i class="bi bi-plus-lg"></i> Novo
    </button>

    <table class="table table-hover">
      <thead><tr><th>{{ "Nome" }}</th><th>{{ "Cliente ID" }}</th><th>{{ "Endereço" }}</th><th></th></tr></thead>
      <tbody>
        @for (item of itens(); track item.id) {
          <tr>
            <td>{{ item.nome }}</td><td>{{ item.clienteId }}</td><td>{{ item.endereco }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" (click)="excluir(item.id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        }
      </tbody>
    </table>

    <!-- Modal -->
    <div class="modal fade" id="modalLocais">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Novo Locai</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="novo.nome"><input class="form-control mb-2" placeholder="Cliente ID" [(ngModel)]="novo.clienteId"><input class="form-control mb-2" placeholder="Endereço" [(ngModel)]="novo.endereco">
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
export class LocaisComponent implements OnInit {
  private api = inject(ApiService);
  itens: any[] = [];
  novo: any = {};

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.listar('locais').subscribe(d => this.itens = d);
  }

  salvar(): void {
    this.api.criar('locais', this.novo).subscribe(() => {
      this.novo = {};
      this.carregar();
    });
  }

  excluir(id: number): void {
    this.api.excluir('locais', id).subscribe(() => this.carregar());
  }
}
