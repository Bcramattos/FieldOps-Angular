import { LOCALE_ID, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import localePt from '@angular/common/locales/pt';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { InspectionsPageComponent } from './pages/inspections/inspections-page.component';
import { PlanningPageComponent } from './pages/planning/planning-page.component';
import { ReviewPageComponent } from './pages/review/review-page.component';
import { ClientsPageComponent, EquipmentPageComponent, HistoryPageComponent, LocationsPageComponent, NonconformitiesPageComponent } from './pages/resources/resource-pages.component';
import { UsersPageComponent } from './pages/users/users-page.component';
import { TemplatesPageComponent } from './pages/templates/templates-page.component';
import { ForbiddenPageComponent } from './pages/forbidden/forbidden-page.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    App,
    MainLayoutComponent,
    LoginPageComponent,
    DashboardPageComponent,
    InspectionsPageComponent,
    PlanningPageComponent,
    ReviewPageComponent,
    ClientsPageComponent,
    EquipmentPageComponent,
    LocationsPageComponent,
    NonconformitiesPageComponent,
    HistoryPageComponent,
    UsersPageComponent,
    TemplatesPageComponent,
    ForbiddenPageComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
  ],
  bootstrap: [App],
})
export class AppModule {}
