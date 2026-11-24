import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Inspecao, StatusInspecao } from '../../core/models/models';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-revisao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  template: `
    <div class="container-fluid p-4">
      @if (inspecao; as i) {
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Revisão — {{ i.codigo }}</h1>
          <span class="badge fs-6" [class.bg-warning]="i.status === 'Aguardando revisão'"
                [class.bg-success]="i.status === 'Aprovada'"
                [class.bg-danger]="i.status === 'Reprovada'">{{ i.status }}</span>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-info-circle"></i> Informações gerais</div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6"><strong>Técnico:</strong> {{ i.tecnico }}</div>
              <div class="col-md-3"><strong>Data:</strong> {{ i.data }}</div>
              <div class="col-md-3"><strong>Prioridade:</strong> {{ i.prioridade }}</div>
            </div>
            <div class="mt-2"><strong>Observações do técnico:</strong> {{ i.observacoes || '—' }}</div>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-exclamation-triangle"></i> Não conformidades identificadas</div>
          <div class="card-body">
            @for (nc of i.naoConformidades; track nc) {
              <div class="alert alert-danger py-2 mb-2"><i class="bi bi-x-octagon"></i> {{ nc }}</div>
            }
            @empty { <div class="text-muted"><i class="bi bi-check-circle"></i> Nenhuma não conformidade identificada</div> }
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-camera"></i> Evidências</div>
          <div class="card-body">
            @for (e of i.evidencias; track e) { <img [src]="e" class="img-thumbnail me-2" width="140"> }
            @empty { <div class="text-muted">Sem evidências anexadas</div> }
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-clock-history"></i> Histórico de status</div>
          <div class="card-body"><div class="text-muted">Histórico registrado nas mudanças de status da inspeção.</div></div>
        </div>

        @if (i.status === 'Aguardando revisão') {
          <div class="d-flex gap-2 mb-4">
            <button class="btn btn-success btn-lg" (click)="decidir('Aprovada')">
              <i class="bi bi-check-circle"></i> Aprovar
            </button>
            <button class="btn btn-danger btn-lg" (click)="decidir('Reprovada')">
              <i class="bi bi-x-circle"></i> Reprovar
            </button>
          </div>
        }
        <a routerLink="/acompanhamento" class="btn btn-secondary">← Voltar ao acompanhamento</a>
      } @else {
        <div class="text-muted p-4">Carregando inspeção...</div>
      }
    </div>
  `
})
export class RevisaoComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  inspecao: Inspecao | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.obter<Inspecao>('inspecoes', id).subscribe(d => this.inspecao = d);
  }

  decidir(status: StatusInspecao): void {
    if (!this.inspecao) return;
    if (status === 'Reprovada' && !confirm('Reprovar a inspeção?')) return;
    this.api.editar<Inspecao>('inspecoes', this.inspecao.id, { status }).subscribe(() => {
      this.inspecao = { ...this.inspecao!, status: status as Inspecao['status'] };
    });
  }
}
