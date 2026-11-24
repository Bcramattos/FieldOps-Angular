import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { InspectionsPageComponent } from './pages/inspections/inspections-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { PlanningPageComponent } from './pages/planning/planning-page.component';
import { ClientsPageComponent, EquipmentPageComponent, HistoryPageComponent, LocationsPageComponent, NonconformitiesPageComponent } from './pages/resources/resource-pages.component';
import { ReviewPageComponent } from './pages/review/review-page.component';
import { FieldOpsAccessGuard } from './core/fieldops-access.guard';
import { UsersPageComponent } from './pages/users/users-page.component';
import { TemplatesPageComponent } from './pages/templates/templates-page.component';
import { ForbiddenPageComponent } from './pages/forbidden/forbidden-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent, title: 'Entrar · FieldOps' },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [FieldOpsAccessGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent, title: 'Visão geral · FieldOps' },
      { path: 'forbidden', component: ForbiddenPageComponent, title: 'Acesso não autorizado · FieldOps' },
      { path: 'inspections', component: InspectionsPageComponent, title: 'Inspeções · FieldOps' },
      { path: 'planning', component: PlanningPageComponent, canActivate: [FieldOpsAccessGuard], data: { roles: ['Administrador', 'Supervisor'] }, title: 'Agenda · FieldOps' },
      { path: 'review', component: ReviewPageComponent, canActivate: [FieldOpsAccessGuard], data: { roles: ['Administrador', 'Supervisor', 'Revisor'] }, title: 'Revisão · FieldOps' },
      {
        path: 'templates',
        component: TemplatesPageComponent,
        canActivate: [FieldOpsAccessGuard],
        data: { roles: ['Administrador', 'Supervisor'] },
        title: 'Modelos · FieldOps',
      },
      { path: 'users', component: UsersPageComponent, canActivate: [FieldOpsAccessGuard], data: { roles: ['Administrador'] }, title: 'Usuários · FieldOps' },
      {
        path: 'equipment',
        component: EquipmentPageComponent,
        title: 'Equipamentos · FieldOps',
      },
      {
        path: 'clients',
        component: ClientsPageComponent,
        title: 'Clientes · FieldOps',
      },
      {
        path: 'locations',
        component: LocationsPageComponent,
        title: 'Locais · FieldOps',
      },
      {
        path: 'nonconformities',
        component: NonconformitiesPageComponent,
        title: 'Não conformidades · FieldOps',
      },
      {
        path: 'history',
        component: HistoryPageComponent,
        canActivate: [FieldOpsAccessGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Revisor'] },
        title: 'Histórico · FieldOps',
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
