import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  styleUrl: '../../theme/original/historico.css',
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Histórico de inspeções</h1>
      <table class="table table-hover">
        <thead><tr><th>Código</th><th>Técnico</th><th>Data</th><th>Status</th><th>Última mudança</th></tr></thead>
        <tbody>
          @for (i of inspecoes(); track i.id) {
            <tr>
              <td>{{ i.codigo }}</td>
              <td>{{ i.tecnico }}</td>
              <td>{{ i.data }}</td>
              <td><span class="badge" [class.bg-secondary]="i.status === 'Planejada'"
                  [class.bg-warning]="i.status === 'Em andamento'"
                  [class.bg-info]="i.status === 'Aguardando revisão'"
                  [class.bg-success]="i.status === 'Aprovada'"
                  [class.bg-danger]="i.status === 'Reprovada' || i.status === 'Cancelada'">{{ i.status }}</span></td>
              <td>{{ i.historico?.length ? i.historico[i.historico.length-1].data + ' por ' + i.historico[i.historico.length-1].responsavel : '—' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class HistoricoComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes = signal<any[]>([]);
  ngOnInit(): void { this.api.listar('inspecoes').subscribe(d => this.inspecoes.set(d)); }
}
