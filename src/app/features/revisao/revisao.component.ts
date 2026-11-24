import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Inspecao, StatusInspecao, Cliente, Local, Equipamento } from '../../core/models/models';
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
                [class.bg-danger]="i.status === 'Reprovada'"
                [class.bg-secondary]="i.status === 'Planejada'">{{ i.status }}</span>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-info-circle"></i> Informações gerais</div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4"><strong>Técnico:</strong> {{ i.tecnico }}</div>
              <div class="col-md-3"><strong>Data:</strong> {{ i.data }}</div>
              <div class="col-md-2"><strong>Prioridade:</strong> {{ i.prioridade }}</div>
              <div class="col-md-3"><strong>Status:</strong> {{ i.status }}</div>
            </div>
            <div class="mt-2"><strong>Observações do técnico:</strong> {{ i.observacoes || '—' }}</div>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-check2-square"></i> Checklist</div>
          <div class="card-body p-0">
            @if (i.checklist && i.checklist.length > 0) {
              <table class="table mb-0">
                <thead><tr><th>Item</th><th>Resposta</th><th>Observação</th></tr></thead>
                <tbody>
                  @for (c of i.checklist; track c.item) {
                    <tr>
                      <td>{{ c.item }}</td>
                      <td><span class="badge" [class.bg-success]="c.resposta === 'ok'"
                          [class.bg-danger]="c.resposta === 'nao_ok'"
                          [class.bg-secondary]="c.resposta === 'na'">
                          {{ c.resposta === 'ok' ? 'OK' : c.resposta === 'nao_ok' ? 'Não conforme' : 'N/A' }}
                        </span></td>
                      <td>{{ c.observacao || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="p-3 text-muted"><i class="bi bi-inbox"></i> Checklist não respondido</div>
            }
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
            @for (e of i.evidencias; track e) {
              <img [src]="e" class="img-thumbnail me-2 mb-2" width="140" (error)="$any($event.target).outerHTML = '<a href=' + e + '>ver evidência</a>'">
            }
            @empty { <div class="text-muted">Sem evidências anexadas</div> }
            <div class="d-flex align-items-center gap-2 mb-2">
              <input type="file" accept="image/*" class="form-control" style="max-width: 360px" (change)="onFileSelected($event)">
              <span class="text-muted small">ou cole uma URL:</span>
            </div>
            <div class="input-group mt-3" style="max-width: 480px">
              <input type="url" class="form-control" placeholder="URL da evidência (imagem)" [(ngModel)]="novaEvidencia">
              <button class="btn btn-outline-primary" (click)="addEvidencia()" [disabled]="!novaEvidencia">
                <i class="bi bi-plus-lg"></i> Adicionar
              </button>
            </div>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header"><i class="bi bi-clock-history"></i> Histórico de status</div>
          <div class="card-body p-0">
            @if (i.historico && i.historico.length > 0) {
              <table class="table mb-0">
                <thead><tr><th>Data</th><th>Status</th><th>Responsável</th></tr></thead>
                <tbody>
                  @for (h of i.historico; track h.data) {
                    <tr><td>{{ h.data }}</td><td>{{ h.status }}</td><td>{{ h.responsavel }}</td></tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="p-3 text-muted">Sem histórico registrado</div>
            }
          </div>
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
  clientes: Cliente[] = [];
  locais: Local[] = [];
  equipamentos: Equipamento[] = [];
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  inspecao: Inspecao | null = null;
  novaEvidencia = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.obter<Inspecao>('inspecoes', id).subscribe(d => this.inspecao = d);
    this.api.listar<Cliente>('clientes').subscribe(d => this.clientes = d);
    this.api.listar<Local>('locais').subscribe(d => this.locais = d);
    this.api.listar<Equipamento>('equipamentos').subscribe(d => this.equipamentos = d);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.novaEvidencia = reader.result as string;
      this.addEvidencia();
    };
    reader.readAsDataURL(file);
  }

  addEvidencia(): void {
    if (!this.inspecao || !this.novaEvidencia) return;
    const evidencias = [...(this.inspecao.evidencias || []), this.novaEvidencia];
    this.api.editar<Inspecao>('inspecoes', this.inspecao.id, { evidencias }).subscribe(() => {
      this.inspecao = { ...this.inspecao!, evidencias };
      this.novaEvidencia = '';
    });
  }

  nomeCliente(id: number): string { return this.clientes.find(c => c.id === id)?.nome || String(id); }
  nomeLocal(id: number): string { return this.locais.find(l => l.id === id)?.nome || String(id); }
  nomeEquipamento(id: number): string { return this.equipamentos.find(e => e.id === id)?.nome || String(id); }

  decidir(status: StatusInspecao): void {
    if (!this.inspecao) return;
    if (status === 'Reprovada' && !confirm('Reprovar a inspeção?')) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const historico = [...(this.inspecao.historico || []), { data: hoje, status, responsavel: 'Supervisor' }];
    this.api.editar<Inspecao>('inspecoes', this.inspecao.id, { status, historico }).subscribe(() => {
      this.inspecao = { ...this.inspecao!, status, historico };
    });
  }
}
