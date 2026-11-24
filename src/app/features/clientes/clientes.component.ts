import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Cliente } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Clientes</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCliente">
          <i class="bi bi-plus-lg"></i> Novo cliente
        </button>
      </div>
      <input class="form-control mb-3" placeholder="Buscar cliente..." [(ngModel)]="busca">
      <table class="table table-hover">
        <thead><tr><th>Nome</th><th>CNPJ</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead>
        <tbody>
          @for (c of filtrar(); track c.id) {
            <tr>
              <td>{{ c.nome }}</td><td>{{ c.cnpj }}</td><td>{{ c.email }}</td><td>{{ c.telefone }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="editar(c)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" (click)="excluir(c.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="modal fade" id="modalCliente">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} cliente</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <input class="form-control mb-2" placeholder="Nome" [(ngModel)]="form.nome">
              <input class="form-control mb-2" placeholder="CNPJ" [(ngModel)]="form.cnpj">
              <input class="form-control mb-2" placeholder="Email" [(ngModel)]="form.email">
              <input class="form-control mb-2" placeholder="Telefone" [(ngModel)]="form.telefone">
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
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);
  clientes: Cliente[] = [];
  busca = '';
  editando = false;
  form: Cliente = { id: 0, nome: '', cnpj: '', email: '', telefone: '' };

  ngOnInit(): void { this.carregar(); }
  carregar(): void { this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d); }
  filtrar(): Cliente[] {
    if (!this.busca) return this.clientes;
    const b = this.busca.toLowerCase();
    return this.clientes.filter(c => c.nome.toLowerCase().includes(b) || c.cnpj.includes(b));
  }
  editar(c: Cliente): void { this.form = { ...c }; this.editando = true; this.abrir(); }
  abrir(): void { const el = document.getElementById('modalCliente'); if (el) { el.classList.add('show'); (el as any).style.display = 'block'; document.body.classList.add('modal-open'); } }
  salvar(): void {
    if (this.editando) { this.api.editar<Cliente>('clientes', this.form.id, this.form).subscribe(() => { this.carregar(); this.reset(); }); }
    else { this.api.criar<Cliente>('clientes', this.form).subscribe(() => { this.carregar(); this.reset(); }); }
  }
  excluir(id: number): void { if (confirm('Excluir cliente?')) this.api.excluir('clientes', id).subscribe(() => this.carregar()); }
  reset(): void { this.form = { id: 0, nome: '', cnpj: '', email: '', telefone: '' }; this.editando = false; }
}
