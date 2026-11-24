import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DemoRole } from '../core/fieldops.models';
import { FieldOpsStore } from '../core/fieldops.store';

interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  badge?: 'inspections' | 'nonconformities' | 'review';
  roles?: DemoRole[];
}

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  menuOpen = false;
  profileOpen = false;
  searchQuery = '';

  readonly navigation: NavigationItem[] = [
    { label: 'Visão geral', route: '/dashboard', icon: 'bi bi-grid-1x2-fill' },
    { label: 'Inspeções', route: '/inspections', icon: 'bi bi-clipboard-check', badge: 'inspections' },
    { label: 'Planejamento', route: '/planning', icon: 'bi bi-calendar3', roles: ['Administrador', 'Supervisor'] },
    { label: 'Modelos', route: '/templates', icon: 'bi bi-folder2-open', roles: ['Administrador', 'Supervisor'] },
    { label: 'Equipamentos', route: '/equipment', icon: 'bi bi-gear-wide-connected' },
    { label: 'Clientes', route: '/clients', icon: 'bi bi-buildings' },
    { label: 'Locais', route: '/locations', icon: 'bi bi-geo-alt' },
    { label: 'Não conformidades', route: '/nonconformities', icon: 'bi bi-exclamation-triangle', badge: 'nonconformities' },
    { label: 'Histórico', route: '/history', icon: 'bi bi-clock-history', roles: ['Administrador', 'Supervisor', 'Revisor'] },
    { label: 'Usuários', route: '/users', icon: 'bi bi-people', roles: ['Administrador'] },
    { label: 'Revisão', route: '/review', icon: 'bi bi-clipboard2-check', badge: 'review', roles: ['Administrador', 'Supervisor', 'Revisor'] },
  ];

  constructor(
    private readonly store: FieldOpsStore,
    private readonly router: Router,
  ) {}

  get visibleNavigation(): NavigationItem[] {
    return this.navigation.filter((item) => !item.roles || this.store.hasRole(item.roles));
  }

  get userName(): string {
    return this.store.userName();
  }

  get roleLabel(): string {
    return this.store.roleLabel();
  }

  get userInitials(): string {
    return this.userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get canManageUsers(): boolean {
    return this.store.hasRole(['Administrador']);
  }

  badgeCount(key: NavigationItem['badge']): number | null {
    if (key === 'inspections') {
      return this.store.inspections().filter((item) => ['Em andamento', 'Planejada', 'Atrasada'].includes(item.status)).length;
    }
    if (key === 'nonconformities') {
      return this.store.records('nonconformities').filter((item) => item.status !== 'Resolvida').length;
    }
    if (key === 'review') {
      return this.store.inspections().filter((item) => item.status === 'Aguardando revisão').length;
    }
    return null;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  runSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) return;
    this.router.navigate(['/inspections'], { queryParams: { q: query } });
    this.closeMenu();
  }

  logout(): void {
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
