import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './features/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-shell d-flex">
      <aside class="sidebar">
        <h5 class="text-white px-3 py-3">FieldOps</h5>
        <app-sidebar />
      </aside>
      <main class="flex-grow-1 p-4">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {}
