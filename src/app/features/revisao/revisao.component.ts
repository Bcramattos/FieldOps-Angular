import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-revisao',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (inspecao; as i) {
      <div class="d-flex justify-content-between mb-4">
        <h1 class="h3 mb-0">Revisão — {{ i.codigo }}</h1>
        <span class="badge fs-6" [class.bg-warning]="i.status === 'Aguardando revisão'"
              [class.bg-success]="i.status === 'Aprovada'"
              [class.bg-danger]="i.status === 'Reprovada'">{{ i.status }}</span>
      </div>

      <div class="card mb-3"><div class="card-body">
        <h5 class="card-title">Informações gerais</h5>
        <p><strong>Técnico:</strong> {{ i.tecnico }} · <strong>Data:</strong> {{ i.data }} ·
           <strong>Prioridade:</strong> {{ i.prioridade }}</p>
        <p><strong>Observações do técnico:</strong> {{ i.observacoes || '—' }}</p>
      </div></div>

      <div class="card mb-3"><div class="card-header">Não conformidades identificadas</div>
        <div class="card-body">
          @for (nc of i.naoConformidades; track nc) { <div class="alert alert-danger py-2">{{ nc }}</div> }
          @empty { <div class="text-muted">Nenhuma não conformidade</div> }
        </div>
      </div>

      <div class="card mb-3"><div class="card-header">Evidências (fotos)</div>
        <div class="card-body">
          @for (e of i.evidencias; track e) { <img [src]="e" class="img-thumbnail me-2" width="120"> }
          @empty { <div class="text-muted">Sem evidências anexadas</div> }
        </div>
      </div>

      <div class="card mb-3"><div class="card-header">Histórico de status</div>
        <div class="card-body"><div class="text-muted">— histórico registrado na inspeção —</div></div>
      </div>

      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-success" (click)="decidir('Aprovada')"><i class="bi bi-check-circle"></i> Aprovar</button>
        <button class="btn btn-danger" (click)="decidir('Reprovada')"><i class="bi bi-x-circle"></i> Reprovar</button>
        <a routerLink="/acompanhamento" class="btn btn-secondary ms-auto">Voltar</a>
      </div>
    }
  `
})
export class RevisaoComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  inspecao: any = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.obter('inspecoes', id).subscribe(d => this.inspecao = d);
  }

  decidir(status: string): void {
    this.api.editar('inspecoes', this.inspecao.id, { status }).subscribe();
  }
}
