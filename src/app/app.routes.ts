import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { LocaisComponent } from './features/locais/locais.component';
import { EquipamentosComponent } from './features/equipamentos/equipamentos.component';
import { ModelosComponent } from './features/modelos/modelos.component';
import { PlanejamentoComponent } from './features/planejamento/planejamento.component';
import { AcompanhamentoComponent } from './features/acompanhamento/acompanhamento.component';
import { RevisaoComponent } from './features/revisao/revisao.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'locais', component: LocaisComponent },
  { path: 'equipamentos', component: EquipamentosComponent },
  { path: 'modelos', component: ModelosComponent },
  { path: 'planejamento', component: PlanejamentoComponent },
  { path: 'acompanhamento', component: AcompanhamentoComponent },
  { path: 'revisao/:id', component: RevisaoComponent },
  { path: '**', redirectTo: 'dashboard' }
];
