import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './features/sidebar/sidebar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    @if (mostrarShell()) {
      <div class="app-shell d-flex">
        <aside class="sidebar">
          <h5 class="px-3 py-3">FieldOps</h5>
          <app-sidebar />
        </aside>
        <main class="flex-grow-1 p-4">
          <router-outlet />
        </main>
      </div>
    } @else {
      <router-outlet />
    }
  `
})
export class AppComponent {
  private router = inject(Router);
  mostrarShell = signal(false);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      this.mostrarShell.set(!url.includes('/login'));
    });
    // estado inicial:
    this.mostrarShell.set(!this.router.url.includes('/login'));
  }
}

// helper signal importado no topo (Angular 17):
import { signal } from '@angular/core';
