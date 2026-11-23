import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Local, Cliente } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-locais',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Locais de inspeção</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalLocal">
          <i class="bi bi-plus-lg"></i> Novo local
        </button>
      </div>
      <table class="table table-hover">
        <thead><tr><th>Nome</th><th>Cliente</th><th>Endereço</th><th>Ações</th></tr></thead>
        <tbody>
          @for (l of locais; track l.id) {
            <tr>
              <td>{{ l.nome }}</td>
              <td>{{ nomeCliente(l.clienteId) }}</td>
              <td>{{ l.endereco }}</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="excluir(l.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="modal fade" id="modalLocal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Novo local</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="form.nome">
              <select class="form-select mb-2" [(ngModel)]="form.clienteId">
                <option [value]="0">Selecione o cliente</option>
                @for (c of clientes; track c.id) { <option [value]="c.id">{{ c.nome }}</option> }
              </select>
              <input class="form-control mb-2" placeholder="Endereço" [(ngModel)]="form.endereco">
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
export class LocaisComponent implements OnInit {
  private api = inject(ApiService);
  locais: Local[] = [];
  clientes: Cliente[] = [];
  form: Local = { id: 0, nome: '', clienteId: 0, endereco: '' };

  ngOnInit(): void {
    this.api.listar<Local>('locais').subscribe(d => this.locais = d);
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d);
  }
  nomeCliente(id: number): string { return this.clientes.find(c => c.id === id)?.nome || String(id); }
  salvar(): void { this.api.criar<Local>('locais', this.form).subscribe(() => { this.form = { id: 0, nome: '', clienteId: 0, endereco: '' }; }); }
  excluir(id: number): void { if (confirm('Excluir?')) this.api.excluir('locais', id).subscribe(); }
}
