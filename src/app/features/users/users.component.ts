import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Usuários / Técnicos</h1>
      <table class="table table-hover">
        <thead><tr><th>Nome</th><th>Inspeções atribuídas</th></tr></thead>
        <tbody>
          @for (u of tecnicos(); track u) {
            <tr><td>{{ u }}</td><td>{{ contagem()[u] || 0 }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes = signal<any[]>([]);
  tecnicos = computed(() => [...new Set(this.inspecoes().map(i => i.tecnico))]);
  contagem = computed(() => {
    const c: any = {};
    this.inspecoes().forEach(i => { c[i.tecnico] = (c[i.tecnico] || 0) + 1; });
    return c;
  });
  ngOnInit(): void { this.api.listar('inspecoes').subscribe(d => this.inspecoes.set(d)); }
}
