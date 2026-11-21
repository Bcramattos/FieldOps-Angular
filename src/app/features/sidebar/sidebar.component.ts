import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar-nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <i class="bi bi-grid-1x2-fill"></i><span>Visão geral</span>
      </a>
      <a routerLink="/acompanhamento" routerLinkActive="active" class="nav-item">
        <i class="bi bi-clipboard-check"></i><span>Inspeções</span>
      </a>
      <a routerLink="/planejamento" routerLinkActive="active" class="nav-item">
        <i class="bi bi-calendar3"></i><span>Planejamento</span>
      </a>
      <a routerLink="/modelos" routerLinkActive="active" class="nav-item">
        <i class="bi bi-folder2-open"></i><span>Modelos</span>
      </a>
      <a routerLink="/equipamentos" routerLinkActive="active" class="nav-item">
        <i class="bi bi-gear-wide-connected"></i><span>Equipamentos</span>
      </a>
      <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
        <i class="bi bi-buildings"></i><span>Clientes</span>
      </a>
    </nav>
  `
})
export class SidebarComponent {}
