import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

interface ChecklistModelo {
  id: number;
  nome: string;
  descricao: string;
  qtdItens: number;
  versao: string;
  status: string;
}

@Component({
  selector: 'app-modelos',
  standalone: true,
  template: `
    <h1 class="h3 mb-4">Modelos de checklist</h1>
    <button class="btn btn-primary mb-3"><i class="bi bi-plus-lg"></i> Novo modelo</button>

    <div class="row g-3">
      @for (m of modelos(); track m.id) {
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ m.nome }}</h5>
              <p class="card-text">{{ m.descricao }}</p>
              <div class="d-flex gap-2 mb-2">
                <span class="badge bg-secondary">{{ m.qtdItens }} itens</span>
                <span class="badge" [class.bg-warning]="m.status === 'rascunho'"
                      [class.bg-success]="m.status === 'publicado'">v{{ m.versao }} — {{ m.status }}</span>
              </div>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-files"></i></button>
                @if (m.status === 'rascunho') {
                  <button class="btn btn-sm btn-outline-success"><i class="bi bi-upload"></i> Publicar</button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ModelosComponent implements OnInit {
  private api = inject(ApiService);
  modelos: ChecklistModelo[] = [];

  ngOnInit(): void {
    this.api.listar<ChecklistModelo>('modelos').subscribe(d => this.modelos = d);
  }
}
