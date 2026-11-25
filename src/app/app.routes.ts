import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { LocaisComponent } from './features/locais/locais.component';
import { EquipamentosComponent } from './features/equipamentos/equipamentos.component';
import { ModelosComponent } from './features/modelos/modelos.component';
import { PlanejamentoComponent } from './features/planejamento/planejamento.component';
import { AcompanhamentoComponent } from './features/acompanhamento/acompanhamento.component';
import { RevisaoComponent } from './features/revisao/revisao.component';
import { LoginComponent } from './features/login/login.component';
import { fieldopsAuthGuard } from './core/fieldops-access.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'locais', component: LocaisComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'equipamentos', component: EquipamentosComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'modelos', component: ModelosComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'planejamento', component: PlanejamentoComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'acompanhamento', component: AcompanhamentoComponent, canActivate: [fieldopsAuthGuard] },
  { path: 'revisao/:id', component: RevisaoComponent, canActivate: [fieldopsAuthGuard] },
  { path: '**', redirectTo: 'login' }
];
