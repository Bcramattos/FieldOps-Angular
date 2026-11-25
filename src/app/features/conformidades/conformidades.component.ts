import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-conformidades',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  styleUrl: '../../theme/original/conformidades.css',
  template: `
    <div class="container-fluid p-4">
      <h1 class="h3 mb-4">Não conformidades</h1>
      @for (insp of inspecoes(); track insp.id) {
        @if (insp.naoConformidades && insp.naoConformidades.length > 0) {
          <div class="card mb-3">
            <div class="card-header"><strong>{{ insp.codigo }}</strong> — {{ insp.tecnico }}</div>
            <div class="card-body py-2">
              @for (nc of insp.naoConformidades; track nc) {
                <div class="alert alert-danger py-2 mb-1"><i class="bi bi-x-octagon"></i> {{ nc }}</div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ConformidadesComponent implements OnInit {
  private api = inject(ApiService);
  inspecoes = signal<any[]>([]);
  ngOnInit(): void { this.api.listar('inspecoes').subscribe(d => this.inspecoes.set(d)); }
}
